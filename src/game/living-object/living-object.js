import { WorldObjectAnimated } from "../world/world-object/animated";
import { warp } from "../utils";
import { ObjectGravity } from "../physic";
import { Game } from "../game";
import { WORLD_MAP_BLOCK_SIZE } from "../settings";
import { TextLabel } from "../utils/label/text-label";
import { SelectionOverlay } from "./utils";
import { LavaStrikeEffect } from "../visual-effects/skills/lava-strike";
import { GushEffect } from "../visual-effects/skills/gush";
import { TornadoEffect } from "../visual-effects/skills/components/common/tornado";
import { WhirlEffect } from "../visual-effects/skills/components/unsorted/whirl";
import { DamageText } from "./utils/damage/damage-text";
import { DamageQueue } from "./utils/damage";
import { LivingObjectInfo } from "./info";

export class LivingObject extends WorldObjectAnimated {

  /**
   * @type {TextLabel}
   * @private
   */
  _label = null;

  /**
   * @type {LivingObjectInfo}
   * @private
   */
  _objectInfo = null;

  /**
   * @type {THREE.Vector3}
   */
  _targetLocation = null;

  /**
   * @type {boolean}
   * @private
   */
  _targetLocationInfinite = false;

  /**
   * @type {LivingObject}
   */
  _targetObject = null;

  /**
   * @type {THREE.Vector3}
   * @private
   */
  _velocityDirection = new THREE.Vector3( 0, 0, 0 );

  /**
   * @type {number}
   * @private
   */
  _velocityScalar = .2;

  /**
   * @type {number}
   * @private
   */
  _objectBlocksHeight = 1;

  /**
   * @type {number}
   * @private
   */
  _objectBlocksRadius = 1;

  /**
   * @type {number}
   * @private
   */
  _objectJumpVelocity = 25;

  /**
   * @type {ObjectGravity}
   * @private
   */
  _gravity = new ObjectGravity();

  /**
   * @type {THREE.Matrix4}
   * @private
   */
  _rotationMatrix;

  /**
   * Object needs to get the target
   * @type {boolean}
   * @private
   */
  _coming = false;

  /**
   * @type {boolean}
   * @private
   */
  _isJumping = false;

  /**
   * @type {boolean}
   * @private
   */
  _needsVerticalUpdate = true;

  /**
   * @param {object} options
   * @returns {*}
   */
  init (options = {}) {
    this._initOptions( options );
    this._createLabel( this._objectInfo.name );
    return super.init( options );
  }

  /**
   * @param {number} deltaTime
   */
  update ( deltaTime ) {
    if (this._coming) {
      if (this.getComingLocationDistance() > warp( this._velocityScalar, deltaTime )) {
        this._nextPosition( deltaTime );
      } else {
        this.setComingState( false );
      }
    }

    if (this._needsVerticalUpdate) {
      this._updateVerticalPosition( deltaTime );
    }

    this._effects && this._effects.forEach((effect, index) => {
      effect.update( deltaTime );

      if (effect.isDone) {
        this._effects.splice( index, 1 );
      }
    });

    super.update( deltaTime );
  }

  /**
   * @param {THREE.Vector3} location
   * @param {boolean} infinite
   */
  setTargetLocation (location, infinite = false) {
    if (!location) {
      return;
    }
    this._targetLocation = new THREE.Vector3( location.x, location.y, location.z );
    this._targetLocationInfinite = infinite;
    this._updateVelocityDirection();
    this.setComingState();
  }

  /**
   * @param {LivingObject} livingObject
   */
  setTargetObject (livingObject) {
    if (!livingObject) {
      return;
    }

    let skills = [ LavaStrikeEffect, GushEffect, TornadoEffect, WhirlEffect ];

    /**
     * @type {EffectComposer}
     */
    const effect = new skills[ Math.floor( Math.random() * skills.length ) % skills.length ]();
    effect.setFrom( this );
    effect.setTo( livingObject );
    effect.init();
    effect.start();

    let damageQueue = DamageQueue.getQueue();

    setTimeout(_ => {
      damageQueue.add({
        damage: Math.floor( Math.random() * 100000 ),
        isForeign: Game.getInstance().world.me.id === livingObject.id,
        isCritical: Math.random() > .7,
        isMiss: Math.random() > .8,
        isImmunity: Math.random() > .9
      }, livingObject, {
        verticalOffset: livingObject.objectHeight * 2,
        maxVerticalOffset: livingObject.objectHeight / 2 + 1,
      });
    }, 300);

    this._effects = (this._effects || []).concat( effect );

    this._targetObject = livingObject;
  }

  /**
   * Resets target object to null
   */
  resetTargetObject () {
    this._targetObject = null;
  }

  /**
   * @param {boolean} coming
   */
  setComingState (coming = true) {
    this._coming = coming;

    if (this.animationMixerInited) {
      let actionName;
      if (coming) {
        actionName = 'RunAction';
      } else {
        actionName = 'Pose';
      }
      if (this.currentClipActionName !== actionName) {
        this.activateClipAction( actionName );
      }
    }
  }

  /**
   * @param {number} velocityScalar
   */
  setVelocityScalar (velocityScalar) {
    this._velocityScalar = velocityScalar;
  }

  /**
   * @returns {THREE.Vector3}
   */
  getComingLocation () {
    if (this._targetLocation) {
      return this._targetLocation.clone();
    }
  }

  /**
   * @returns {number}
   */
  getComingLocationDistance () {
    let comingLocation = this.getComingLocation();
    return comingLocation && comingLocation.setY( 0 )
      .distanceTo(
        this.position.clone().setY( 0 )
      ) || 0;
  }

  /**
   * Object jump with own velocity
   */
  jump () {
    if (!this._needsVerticalUpdate) {
      this._resumeVerticalUpdate();
    }
    this._isJumping = true;
    this._gravity.setVelocity( -this._objectJumpVelocity );
  }

  /**
   * Adds selection sprite below
   */
  select () {
    let overlay = SelectionOverlay.getOverlay();
    overlay.attachToObject( this );
  }

  /**
   * Removes selection sprite below
   */
  deselect () {
    let overlay = SelectionOverlay.getOverlay();
    if (overlay.isAttached
      && this.id === overlay.attachedTo.id) {
      overlay.detachFromObject();
    }
  }

  /**
   * Disposes the object
   */
  dispose () {
    this._destroyLabel();
    // todo: add more
  }

  /**
   * @returns {THREE.Vector3}
   */
  get targetLocation () {
    return this._targetLocation;
  }

  /**
   * @returns {boolean}
   */
  get targetLocationInfinite () {
    return this._targetLocationInfinite;
  }

  /**
   * @returns {LivingObject}
   */
  get targetObject () {
    return this._targetObject;
  }

  /**
   * @returns {boolean}
   */
  get isComing () {
    return this._coming;
  }

  /**
   * @returns {boolean}
   */
  get isJumping () {
    return this._isJumping;
  }

  /**
   * @returns {number}
   */
  get velocityScalar () {
    return this._velocityScalar;
  }

  /**
   * @returns {THREE.Vector3}
   */
  get velocityDirection () {
    return this._velocityDirection;
  }

  /**
   * @returns {number}
   */
  get objectBlocksHeight () {
    return this._objectBlocksHeight;
  }

  /**
   * @returns {number}
   */
  get objectHeight () {
    return this._objectBlocksHeight * WORLD_MAP_BLOCK_SIZE;
  }

  /**
   * @returns {number}
   */
  get objectBlocksRadius () {
    return this._objectBlocksRadius;
  }

  /**
   * @returns {number}
   */
  get objectRadius () {
    return this._objectBlocksRadius * WORLD_MAP_BLOCK_SIZE;
  }

  /**
   * @returns {number}
   */
  get objectJumpVelocity () {
    return this._objectJumpVelocity;
  }

  /**
   * @returns {WorldMap}
   */
  get map () {
    return Game.getInstance().world.map;
  }

  /**
   * @returns {TextLabel}
   */
  get label () {
    return this._label;
  }

  /**
   * @return {LivingObjectInfo}
   */
  get objectInfo () {
    return this._objectInfo;
  }

  /**
   * @param {object} options
   * @private
   */
  _initOptions (options) {
    let {
      velocityScalar,
      gravity,
      objectBlocksHeight,
      objectBlocksRadius,
      objectJumpVelocity,
      objectInfo
    } = options;

    this._velocityScalar = velocityScalar;
    this._objectBlocksHeight = objectBlocksHeight;
    this._objectBlocksRadius = objectBlocksRadius;
    this._objectJumpVelocity = objectJumpVelocity;

    this._gravity.setAcceleration( gravity );

    this._objectInfo = new LivingObjectInfo( objectInfo );
  }

  /**
   * @param {string} text
   * @param {*} options
   * @private
   */
  _createLabel (text, options = {}) {
    const defaultOptions = {
      textSize: 3,
      textureOptions: {
        fontWeight: 'bold',
        fontFamily: '"Yanone Kaffeesatz", Arial, Helvetica, sans-serif',
        fontColor: 'rgba(255, 255, 255, .85)',
        strokeColor: 'rgba(0, 0, 0, .3)',
        strokeWidth: 2
      },
      materialOptions: {
        color: 0xffffff,
        fog: true
      },
    };
    options = Object.assign( {}, defaultOptions, options );

    this._label = new TextLabel( text, options, this );
    this._label.setOffsetPosition( new THREE.Vector3(0, this.objectHeight * 1.5, 0) );
    this._label.setVerticalOffset( this.objectHeight * 1.5, this.objectHeight / 2 + 1 );
    this._label.attachToObject();
  }

  /**
   * Attaches label to object
   */
  _attachLabel () {
    this._label && this._label.attachToObject();
  }

  /**
   * Detaches label from object
   */
  _detachLabel () {
    this._label && this._label.detachFromObject();
  }

  /**
   * Destroys label for object
   */
  _destroyLabel () {
    this._label && this._label.dispose();
  }

  /**
   * @param {number} deltaTime
   * @private
   */
  _nextPosition ( deltaTime ) {
    let shiftVector = this._velocityDirection.clone()
      .normalize()
      .multiplyScalar(
        warp( this._velocityScalar, deltaTime )
      );

    let { shiftPosition, changed } = this.map.collisions.clampNextPosition(
      this.position, shiftVector, {
        objectBlocksRadius: this._objectBlocksRadius,
        objectBlocksHeight: this._objectBlocksHeight
      }
    );

    if (changed) {
      this._updateVelocityDirection();
    }

    let oldPosition = this.position.clone();
    this.position.add( shiftPosition );
    let distancePassed = oldPosition.distanceTo( this.position );
    if (distancePassed < .01 && !this._targetLocationInfinite) {
      this.setComingState( false );
    }

    if (!this._needsVerticalUpdate) {
      this._resumeVerticalUpdate();
    }

    if (this.mesh) {
      this.mesh.setRotationFromMatrix( this._rotationMatrix );
    }
  }

  /**
   * @private
   */
  _updateVerticalPosition ( deltaTime ) {
    let shiftY = -this._gravity.update( deltaTime );
    let falling = shiftY < 0;

    let result = this.map.collisions.clampVerticalPosition(
      this.position, shiftY, {
        objectBlocksRadius: this._objectBlocksRadius,
        objectBlocksHeight: this._objectBlocksHeight
      }
    );
    shiftY = result.shiftY;
    this.position.y += shiftY;

    if (result.changed) {
      this._gravity.resetVelocity();

      if (falling) {
        !this._coming && this._stopVerticalUpdate();
        this._isJumping && (this._isJumping = false);
      }
    }
  }

  /**
   * @private
   */
  _stopVerticalUpdate () {
    this._gravity.stopUpdatingVelocity();
    this._gravity.resetVelocity();
    this._needsVerticalUpdate = false;
  }

  /**
   * @private
   */
  _resumeVerticalUpdate () {
    this._gravity.resumeUpdatingVelocity();
    this._needsVerticalUpdate = true;
  }

  /**
   * @private
   */
  _updateVelocityDirection () {
    let target = this.getComingLocation().setY( 0 );
    let current = this.position.clone().setY( 0 );
    this._velocityDirection = target.sub( current ).normalize();

    this._updateRotationMatrix();
  }

  /**
   * @private
   */
  _updateRotationMatrix () {
    let velocityDirection = this._velocityDirection.clone();
    let originDirection = new THREE.Vector3(0, 0, -1);

    let cross = velocityDirection.clone().cross(originDirection);

    let angle = velocityDirection.angleTo( originDirection );
    let angleSign = cross.y < 0 ? 1 : -1;

    let rotationMatrix = new THREE.Matrix4();
    let axis = new THREE.Vector3( 0, 1, 0 ).normalize();
    rotationMatrix.makeRotationAxis( axis, angleSign * angle );

    this._rotationMatrix = rotationMatrix;
  }
}
