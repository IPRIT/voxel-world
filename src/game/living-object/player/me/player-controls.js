import * as utils from "../../../utils";
import { LivingObject } from "../../living-object";
import { Game } from "../../../game";

export class PlayerControls {

  /**
   * @type {PlayerMe}
   * @private
   */
  _me = null;

  /**
   * @type {WorldObjectBase}
   * @private
   */
  _highlightedObject = null;

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
   * @type {{x: number, y: number}}
   * @private
   */
  _clickedAt = { x: 0, y: 0 };

  /**
   * @type {number}
   * @private
   */
  _lastTabPressedMs = 0;

  /**
   * @type {number}
   * @private
   */
  _lastEscPressedMs = 0;

  /**
   * @type {number}
   * @private
   */
  _keyPressDelay = 250;

  /**
   * @type {THREE.Raycaster}
   * @private
   */
  _mapRaycaster = new THREE.Raycaster();

  /**
   * @type {boolean}
   * @private
   */
  _mouseDown = false;

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
    window.addEventListener( 'keydown', this._onKeyDown.bind(this), false );
    window.addEventListener( 'mousedown', this._onMouseDown.bind(this), false );
    window.addEventListener( 'mousemove', this._onMouseMove.bind(this), false );
    window.addEventListener( 'mouseup', this._onMouseUp.bind(this), false );
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

    if (keyboardState.pressed( 'W' ) && keyboardState.pressed( 'S' )) {
      // we shouldn't add direction
    } else if (keyboardState.pressed( 'W' )) {
      keyboardDirection.add( cameraDirection );
    } else if (keyboardState.pressed( 'S' )) {
      keyboardDirection.add( cameraDirection.clone().negate() );
    }

    if (keyboardState.pressed( 'A' ) && keyboardState.pressed( 'D' )) {
      // we shouldn't add direction
    } else if (keyboardState.pressed( 'A' )) {
      keyboardDirection.add(
        this._rotateWorldDirection( cameraDirection.clone(), Math.PI / 2 )
      );
    } else if (keyboardState.pressed( 'D' )) {
      keyboardDirection.add(
        this._rotateWorldDirection( cameraDirection.clone(), -Math.PI / 2 )
      );
    }

    keyboardDirection.normalize();

    if (utils.isVectorZeroStrict( keyboardDirection )) {
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
    const currentTimeMs = Date.now();
    let keyboardState = this._keyboardState;
    let spacePressed = keyboardState.pressed( 'space' );
    let escPressed = keyboardState.pressed( 'escape' );
    let tabPressed = keyboardState.pressed( 'tab' );

    if (spacePressed) {
      this._me.jump();
    }

    if (escPressed && this._lastEscPressedMs + this._keyPressDelay < currentTimeMs) {
      if (this._me.isComing && !this._playerWalkingByKeyboard) {
        this._me.setComingState( false );
      } else {
        this._me.resetTargetObject();
      }
      this._lastEscPressedMs = currentTimeMs;
    }

    if (tabPressed && this._lastTabPressedMs + this._keyPressDelay < currentTimeMs) {
      const game = Game.getInstance();
      const nextTargetObject = game.world.getNextLivingObject( this._me, this._me.targetObject || this._me );
      this._me.setTargetObject( nextTargetObject );
      this._lastTabPressedMs = currentTimeMs;
    }
  }

  /**
   * @param {KeyboardEvent} event
   * @private
   */
  _onKeyDown (event) {
    if ([ 9 ].includes( event.keyCode )) {
      event.preventDefault();
    }
  }

  /**
   * @param {MouseEvent} event
   * @private
   */
  _onMouseDown (event) {
    this._mouseDown = true;
    const isTouchEvent = event.type === 'touchstart';
    if (event.which !== 1 && !isTouchEvent) {
      return;
    }
    const game = Game.getInstance();
    const map = game.world.map;

    this._clickedAt = this._normalizeCursorPoint( event );

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
    } else if (!this._playerWalkingByKeyboard) {
      this._me.setTargetLocation( intersects[0].point );
    }
  }

  /**
   * @param {MouseEvent} event
   * @private
   */
  _onMouseMove (event) {
    if (!this._mouseDown) {
      this._handleHighlight( event );
    }
  }

  /**
   * @param {MouseEvent} event
   * @private
   */
  _onMouseUp (event) {
    this._mouseDown = false;
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
   * @param {MouseEvent} event
   * @private
   */
  _handleHighlight (event) {
    const game = Game.getInstance();
    const map = game.world.map;
    const mousePoint = this._normalizeCursorPoint( event );

    // update the picking ray with the camera and mouse position
    this._mapRaycaster.setFromCamera( mousePoint, this._me.camera );
    // calculate objects intersecting the picking ray
    const intersects = this._mapRaycaster.intersectObjects(
      [ ...game.world.playersMeshes, ...map.getMeshes() ]
    );

    if (!intersects.length) {
      if (this._highlightedObject) {
        this._unhighlightObject( this._highlightedObject );
      }
      return;
    }

    /**
     * @type {LivingObject|*} object3D
     */
    let object3D = intersects[0].object && intersects[0].object.parent;
    let isLivingObject = object3D instanceof LivingObject;


    if (!isLivingObject
      || this._highlightedObject
      && this._highlightedObject.id === object3D.id) {
      if (!isLivingObject && this._highlightedObject) {
        this._unhighlightObject( this._highlightedObject );
      }
      return;
    }

    if (this._highlightedObject) {
      this._unhighlightObject( this._highlightedObject );
    }

    this._highlightedObject = object3D;
    this._highlightObject( object3D );
  }

  /**
   * @param {WorldObjectBase} objectBase
   * @private
   */
  _highlightObject (objectBase) {
    objectBase.highlight( 0x777777 );
    this._highlightedObject = objectBase;
  }

  /**
   * @param {WorldObjectBase} objectBase
   * @private
   */
  _unhighlightObject (objectBase) {
    objectBase.unhighlight();
    this._highlightedObject = null;
  }

  /**
   * @private
   */
  _removeMouseEvents () {
    window.removeEventListener( 'keydown', this._onKeyDown.bind(this), false );
    window.removeEventListener( 'mousedown', this._onMouseDown.bind(this), false );
    window.removeEventListener( 'mousemove', this._onMouseMove.bind(this), false );
    window.removeEventListener( 'mouseup', this._onMouseUp.bind(this), false );
    window.removeEventListener( 'touchstart', this._onMouseDown.bind(this), false );
  }

  /**
   * @param {*} event
   * @returns {{x: number, y: number}}
   * @private
   */
  _cursorPoint (event) {
    const isTouchEvent = event.type === 'touchstart';

    let targetEvent = event;
    if (isTouchEvent) {
      targetEvent = event.targetTouches[0];
    }

    const { clientX, clientY } = targetEvent;
    return { x: clientX, y: clientY };
  }

  /**
   * @param {*} event
   * @returns {{x: number, y: number}}
   * @private
   */
  _normalizeCursorPoint (event) {
    return this._normalizeScreenPoint(
      this._cursorPoint( event )
    );
  }

  /**
   * @param {{x: number, y: number}} point2d
   * @returns {{x: number, y: number}}
   * @private
   */
  _normalizeScreenPoint (point2d) {
    return {
      x: ( point2d.x / window.innerWidth ) * 2 - 1,
      y: - ( point2d.y / window.innerHeight ) * 2 + 1
    };
  }
}
