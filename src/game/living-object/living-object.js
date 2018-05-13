import { WorldObjectAnimated } from "../world/world-object/animated";
import { warp } from "../utils";
import { WORLD_MAP_BLOCK_SIZE } from "../settings";
import { ObjectGravity } from "../physic";

export class LivingObject extends WorldObjectAnimated {

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
  _velocityDirection = new THREE.Vector3(0, 0, 0);

  /**
   * @type {number}
   * @private
   */
  _velocityScalar = 0;

  /**
   * @type {number}
   * @private
   */
  _objectBlocksHeight = 3;

  /**
   * @type {number}
   * @private
   */
  _objectBlocksRadius = 1;

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
    return super.init( options );
  }

  /**
   * @param {number} deltaTime
   */
  update ( deltaTime ) {
    if (this._coming) {
      if (this._targetObject && !this._targetLocation) {
        this._updateVelocityDirection();
      }

      if (this.getComingLocationDistance() > warp( this._velocityScalar, deltaTime )) {
        this._nextPosition( deltaTime );
      } else {
        this.setComingState( false );
      }
    }

    if (this._needsVerticalUpdate) {
      this._updateVerticalPosition( deltaTime );
    }

    super.update( deltaTime );
  }

  /**
   * @param {THREE.Vector3} location
   * @param {boolean} infinite
   */
  setTargetLocation (location, infinite = false) {
    if (location) {
      this._targetLocation = new THREE.Vector3(location.x, location.y, location.z);
      this._targetLocationInfinite = infinite;
      this._updateVelocityDirection();
      this.setComingState();
    }
  }

  /**
   * @param {LivingObject} livingObject
   */
  setTargetObject (livingObject) {
    if (livingObject) {
      if (this._targetObject
        && this._targetObject.id === livingObject.id) {
        this.setComingState();
      }
      this._targetObject = livingObject;
      this._targetLocation = null;
      this._updateVelocityDirection();
    }
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
    return this._targetObject && this.targetObject.position.clone();
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

  jump () {
    if (!this._needsVerticalUpdate) {
      this._resumeVerticalUpdate();
    }
    this._isJumping = true;
    this._gravity.setVelocity(-50);
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
  get objectBlocksRadius () {
    return this._objectBlocksRadius;
  }

  /**
   * @returns {WorldMap}
   */
  get map () {
    return game.world.map;
  }

  /**
   * @param {object} options
   * @private
   */
  _initOptions (options) {
    let { velocityScalar, gravity, objectBlocksHeight, objectBlocksRadius } = options;
    this._velocityScalar = velocityScalar;
    this._objectBlocksHeight = objectBlocksHeight;
    this._objectBlocksRadius = objectBlocksRadius;

    this._gravity.setAcceleration( gravity );
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
    this.position.add( shiftPosition.setY( 0 ) );
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
