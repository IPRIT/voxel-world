import { warp } from "../../utils";
import { ParticleState } from "./particle-state";

export class Particle extends THREE.Mesh {

  /**
   * @type {number}
   * @private
   */
  _timeScale = 1;

  /**
   * @type {number}
   * @private
   */
  _state = ParticleState.NOT_RUNNING;

  /**
   * @type {number}
   * @private
   */
  _lifetimeMs = 10000;

  /**
   * @type {number}
   * @private
   */
  _lifeStartedAtMs = 0;

  /**
   * @type {number}
   * @private
   */
  _currentLifetimeMs = 0;

  /**
   * @type {THREE.Vector3}
   * @private
   */
  _velocity = new THREE.Vector3();

  /**
   * @type {THREE.Vector3}
   * @private
   */
  _rotationVelocity = new THREE.Vector3();

  /**
   * @type {THREE.Vector3}
   * @private
   */
  _acceleration = new THREE.Vector3();

  /**
   * @param {THREE.BufferGeometry|THREE.Geometry} geometry
   * @param {THREE.Material} material
   */
  constructor (geometry, material) {
    super( geometry, material );
  }

  /**
   * @param {*} options
   */
  setOptions (options = {}) {
    let {
      velocity = new THREE.Vector3(),
      rotationVelocity = new THREE.Vector3(),
      acceleration = new THREE.Vector3(),
      position = new THREE.Vector3(),
      scale = 1,
      lifetime = 10000,
      timeScale = 1,
    } = options;

    this._velocity = velocity.clone();
    this._acceleration = acceleration.clone();
    this._rotationVelocity = rotationVelocity.clone();
    this._timeScale = timeScale;
    this._lifetimeMs = lifetime;

    this.scale.set( scale, scale, scale );
    this.position.copy( position );
  }

  /**
   * @param {number} deltaTime
   */
  update (deltaTime) {
    if (this.isStopped) {
      return;
    }
    deltaTime *= this._timeScale;

    this._updateVelocity( deltaTime );
    this._updatePosition( deltaTime );
    this._updateRotation( deltaTime );

    this._currentLifetimeMs += deltaTime * 1000;
    this._checkLifetime();
  }

  /**
   * Use this method for resetting some variables before start
   */
  beforeStart () {
    this._currentLifetimeMs = 0;
  }

  /**
   * Run particle animation
   */
  start () {
    this.beforeStart();
    this._lifeStartedAtMs = Date.now();
    this._state = ParticleState.RUNNING;
  }

  beforeRelease () {
    if (this.parent) {
      this.parent.remove( this );
    }
  }

  release () {
    this.beforeRelease();
    this._state = ParticleState.NOT_RUNNING;
  }

  /**
   * @returns {boolean}
   */
  get shadows () {
    return this.castShadow || this.receiveShadow;
  }

  /**
   * @param {boolean} value
   */
  set shadows (value) {
    this.receiveShadow = value;
    this.castShadow = value;
  }

  /**
   * @returns {number}
   */
  get lifetime () {
    return this._lifetimeMs;
  }

  /**
   * @returns {THREE.Vector3}
   */
  get velocity () {
    return this._velocity;
  }

  /**
   * @returns {THREE.Vector3}
   */
  get acceleration () {
    return this._acceleration;
  }

  /**
   * @returns {number}
   */
  get currentLifetime () {
    return this._currentLifetimeMs;
  }

  /**
   * @returns {number}
   */
  get state () {
    return this._state;
  }

  /**
   * @returns {number}
   */
  get timeScale () {
    return this._timeScale;
  }

  /**
   * @param {number} value
   */
  set timeScale (value) {
    this._timeScale = value;
  }

  /**
   * @returns {boolean}
   */
  get isRunning () {
    return this._state === ParticleState.RUNNING;
  }

  /**
   * @returns {boolean}
   */
  get isStopped () {
    return this._state === ParticleState.NOT_RUNNING;
  }

  /**
   * @param {number} deltaTime
   * @private
   */
  _updateVelocity (deltaTime) {
    const timeWarp = warp( 1, deltaTime );
    this._velocity.x += this._acceleration.x * timeWarp;
    this._velocity.y += this._acceleration.y * timeWarp;
    this._velocity.z += this._acceleration.z * timeWarp;
  }

  /**
   * @param {number} deltaTime
   * @private
   */
  _updatePosition (deltaTime) {
    this.position.add(
      this._computeNextDeltaPosition( deltaTime )
    );
  }

  /**
   * @param {number} deltaTime
   * @private
   */
  _updateRotation (deltaTime) {
    this.rotation.x += warp( this._rotationVelocity.x, deltaTime );
    this.rotation.y += warp( this._rotationVelocity.y, deltaTime );
    this.rotation.z += warp( this._rotationVelocity.z, deltaTime );
  }

  /**
   * @param {number} deltaTime
   * @returns {number}
   * @private
   */
  _computeNextDeltaPosition (deltaTime) {
    const velocity = this._velocity.clone();
    const acceleration = this._acceleration.clone();
    return velocity.multiplyScalar( deltaTime ).add(
      acceleration.multiplyScalar( deltaTime * deltaTime * .5 )
    );
  }

  /**
   * @private
   */
  _checkLifetime () {
    if (this._currentLifetimeMs >= this._lifetimeMs) {
      this.release();
    }
  }
}
