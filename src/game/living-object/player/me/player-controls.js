import { isVectorZeroStrict } from "../../../utils";

export class PlayerControls {

  /**
   * @type {PlayerMe}
   * @private
   */
  _me = null;

  /**
   * @type {THREE.Vector3}
   * @private
   */
  _oldInfinitePoint = new THREE.Vector3();

  /**
   * @type {boolean}
   * @private
   */
  _playerWalkingByKeyboard = false;

  /**
   * @param {PlayerMe} player
   */
  constructor (player) {
    this._me = player;
  }

  init () {
    this._initKeyboardState();
  }

  /**
   * @param deltaTime
   */
  update (deltaTime) {
    this._handleKeyboard();
  }

  /**
   * Destroys the keyboard state handler
   */
  destroy () {
    if (this._keyboardState) {
      this._keyboardState.destroy();
    }
  }

  /**
   * @private
   */
  _initKeyboardState () {
    this._keyboardState = new THREEx.KeyboardState();
  }

  /**
   * @private
   */
  _handleKeyboard () {
    this._handleKeyboardWalk();
  }

  /**
   * @private
   */
  _handleKeyboardWalk () {
    const keyboardState = this._keyboardState;
    const cameraDirection = this._me.camera.cameraDirection.setY( 0 );

    let keyboardDirection = new THREE.Vector3();
    let spacePressed = keyboardState.pressed( 'space' );
    let escPressed = keyboardState.pressed( 'escape' );

    if (spacePressed) {
      this._me.jump();
    }
    if (escPressed) {
      this._me.setComingState( false );
    }

    if (keyboardState.pressed( 'W' )) {
      keyboardDirection.add( cameraDirection );
    } else if (keyboardState.pressed( 'S' )) {
      keyboardDirection.add( cameraDirection.clone().negate() );
    }

    if (keyboardState.pressed( 'A' )) {
      keyboardDirection.add(
        this._rotateWorldDirection( cameraDirection.clone(), Math.PI / 2 )
      );
    } else if (keyboardState.pressed( 'D' )) {
      keyboardDirection.add(
        this._rotateWorldDirection( cameraDirection.clone(), -Math.PI / 2 )
      );
    }

    keyboardDirection.normalize();

    if (isVectorZeroStrict( keyboardDirection )) {
      if (this._playerWalkingByKeyboard) {
        // reset current point
        this._oldInfinitePoint = new THREE.Vector3( );
        this._me.setComingState( false );
      }
      return ( this._playerWalkingByKeyboard = false );
    }
    this._playerWalkingByKeyboard = true;

    let infinitePoint = keyboardDirection.clone().multiplyScalar( 1e9 );
    if (this._oldInfinitePoint.distanceTo( infinitePoint ) > 1e-5) {
      this._updateTargetLocation( infinitePoint );
      this._oldInfinitePoint = infinitePoint;
    }
  }

  /**
   * @param {THREE.Vector3} point
   * @private
   */
  _updateTargetLocation (point) {
    this._me.setTargetLocation( point, true );
  }

  /**
   * @param {THREE.Vector3} vector
   * @param {number} angle
   * @private
   */
  _rotateWorldDirection (vector, angle) {
    const verticalAxis = new THREE.Vector3( 0, 1, 0 );

    return vector.applyAxisAngle( verticalAxis, angle );
  }
}
