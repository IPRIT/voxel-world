import { isVectorZeroStrict } from "../../../utils";
import { WORLD_MAP_BLOCK_SIZE } from "../../../settings";
import { LivingObject } from "../../living-object";

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
   * @type {THREE.Vector2}
   * @private
   */
  _clickedAt = new THREE.Vector2();

  /**
   * @type {THREE.Raycaster}
   * @private
   */
  _mapRaycaster = new THREE.Raycaster();

  /**
   * @param {PlayerMe} player
   */
  constructor (player) {
    this._me = player;
  }

  init () {
    this._initKeyboardState();
    this._initMouseEvents();
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
    this._removeMouseEvents();
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
  _initMouseEvents () {
    window.addEventListener( 'mousedown', this._onMouseDown.bind(this), false );
    window.addEventListener( 'touchstart', this._onMouseDown.bind(this), false );
  }

  /**
   * @private
   */
  _handleKeyboard () {
    this._handleKeyboardWalk();
    this._handleKeyboardEvents();
  }

  /**
   * @private
   */
  _handleKeyboardWalk () {
    const keyboardState = this._keyboardState;
    const cameraDirection = this._me.camera.cameraDirection.setY( 0 );

    let keyboardDirection = new THREE.Vector3();

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
   * @private
   */
  _handleKeyboardEvents () {
    let keyboardState = this._keyboardState;
    let spacePressed = keyboardState.pressed( 'space' );
    let escPressed = keyboardState.pressed( 'escape' );

    if (spacePressed) {
      this._me.jump();
    }
    if (escPressed) {
      this._me.setComingState( false );
    }
  }

  /**
   * @param {MouseEvent} event
   * @private
   */
  _onMouseDown (event) {
    let isTouchEvent = event.type === 'touchstart';
    if (event.which !== 1 && !isTouchEvent) {
      return;
    }
    let map = game.world.map;

    let targetEvent;
    if (isTouchEvent) {
      targetEvent = event.targetTouches[0];
    } else {
      targetEvent = event;
    }

    let { clientX, clientY } = targetEvent;

    this._clickedAt.x = ( clientX / window.innerWidth ) * 2 - 1;
    this._clickedAt.y = - ( clientY / window.innerHeight ) * 2 + 1;
    // update the picking ray with the camera and mouse position
    this._mapRaycaster.setFromCamera( this._clickedAt, this._me.camera );
    // calculate objects intersecting the picking ray
    const intersects = this._mapRaycaster.intersectObjects(
      [ ...game.world.playersMeshes, ...map.getMeshes(), map.groundPlate.children[0] ]
    );

    if (!intersects.length) {
      return;
    }

    let object3D = intersects[0].object && intersects[0].object.parent;
    let isLivingObject = object3D instanceof LivingObject;

    if (isLivingObject) {
      this._me.setTargetObject( object3D );
    } else {
      this._me.setTargetLocation( intersects[0].point );
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

  /**
   * @private
   */
  _removeMouseEvents () {
    window.removeEventListener( 'mousedown', this._onMouseDown.bind(this), false );
    window.removeEventListener( 'touchstart', this._onMouseDown.bind(this), false );
  }
}
