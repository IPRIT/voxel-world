import { WorldObjectAnimated } from "../world/world-object/animated";
import { warp } from "../utils";

const EPS = 1e-5;

export class LivingObject extends WorldObjectAnimated {

  /**
   * @type {THREE.Vector3}
   */
  _targetLocation = null;

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
   * @type {THREE.Matrix4}
   * @private
   */
  _rotationMatrix;

  /**
   * Player needs to get the target
   * @type {boolean}
   * @private
   */
  _coming = false;

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

      if (this.getComingLocationDistance() > 2 * this._velocityScalar) {
        this._nextPosition( deltaTime );
        if (!this._coming) {
          this.setComingState();
        }
      } else {
        this.setComingState( false );
      }
    }

    super.update( deltaTime );
  }

  /**
   * @param {THREE.Vector3} location
   */
  setTargetLocation (location) {
    if (location) {
      this._targetLocation = new THREE.Vector3(location.x, location.y, location.z);
      this._updateVelocityDirection();
      this.setComingState();
    }
  }

  /**
   * @param {LivingObject} livingObject
   */
  setTargetObject (livingObject) {
    if (livingObject) {
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
    return comingLocation && comingLocation.distanceTo( this.position ) || 0;
  }

  /**
   * @returns {THREE.Vector3}
   */
  get targetLocation () {
    return this._targetLocation;
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
   * @param {object} options
   * @private
   */
  _initOptions (options) {
    let { velocityScalar } = options;
    this._velocityScalar = velocityScalar;
  }

  /**
   * @param {number} deltaTimeMs
   * @private
   */
  _nextPosition ( deltaTimeMs ) {
    let shiftVector = this._velocityDirection.clone()
      .normalize()
      .multiplyScalar(
        warp( this._velocityScalar, deltaTimeMs )
      );

    this.position.add( shiftVector );

    if (this.mesh) {
      this.mesh.setRotationFromMatrix( this._rotationMatrix );
    }
  }

  /**
   * @private
   */
  _updateVelocityDirection () {
    let target = this.getComingLocation();
    let current = this.position.clone();
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
