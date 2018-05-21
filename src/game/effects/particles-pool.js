import { WORLD_MAP_BLOCK_SIZE } from "../settings";
import { ParticlesPromise } from "./particles-promise";

const PARTICLES_DEFAULT_POOL_SIZE = 1e4;

export class ParticlesPool {

  /**
   * @type {ParticlesPool}
   * @private
   */
  static _instance = null;

  /**
   * @returns {ParticlesPool}
   */
  static getPool() {
    if (!this._instance) {
      return ( this._instance = new ParticlesPool() );
    }
    return this._instance;
  }

  /**
   * @type {number}
   * @private
   */
  _poolSize = PARTICLES_DEFAULT_POOL_SIZE;

  /**
   * @type {Array<THREE.Mesh>}
   * @private
   */
  _pool = [];

  /**
   * @type {boolean}
   * @private
   */
  _poolReady = false;

  /**
   * @type {Array<ParticlesPromise>}
   * @private
   */
  _promises = [];

  /**
   * @param {THREE.Mesh} sourceObject
   */
  createPool (sourceObject = null) {
    if (this._poolReady) {
      console.warn('[Warn] Particles Pool already initialized');
    }
    this._pool = [];
    sourceObject = sourceObject || this._createSourceObject();

    for (let i = 0; i < this._poolSize; ++i) {
     this._createParticle( sourceObject );
    }

    this._poolReady = true;
  }

  /**
   * @param {number} particlesNumber
   * @returns {ParticlesPromise}
   */
  take (particlesNumber = 0) {
    particlesNumber = Math.min( Math.max( particlesNumber, 0 ), this.poolFreeSize );

    if (!this._poolReady) {
      particlesNumber = 0;
    }

    // console.info(`[ParticlesPool] got ${particlesNumber} particles from the pool`);

    let particles = this._pool.splice( 0, particlesNumber );
    let promise = new ParticlesPromise( particles );

    this._promises.push( promise );
    return promise;
  }

  /**
   * @param {ParticlesPromise} targetPromise
   */
  transfer (targetPromise) {
    // console.info(`[ParticlesPool] transferring ${targetPromise.size} particles back to the pool`);

    let promiseIndex = this._findPromiseIndex( targetPromise );
    if (promiseIndex >= 0) {
      this._promises.splice( promiseIndex, 1 );
    }

    let particles = targetPromise.particles || [];
    this._pool = this._pool.concat( particles );

    targetPromise.onFulfill( particles );
    targetPromise.dispose();
  }

  /**
   * @returns {number}
   */
  get poolMaxSize () {
    return this._poolSize;
  }

  /**
   * @returns {number}
   */
  get poolFreeSize () {
    return this._pool.length;
  }

  /**
   * @returns {Array<*>}
   */
  get promises () {
    return this._promises;
  }

  /**
   * @returns {boolean}
   */
  get poolReady () {
    return this._poolReady;
  }

  /**
   * @param {*} options
   * @private
   */
  _initOptions (options = {}) {
    let {
      poolSize = PARTICLES_DEFAULT_POOL_SIZE
    } = options;
    this._poolSize = poolSize;
  }

  /**
   * @returns {THREE.Mesh}
   * @private
   */
  _createSourceObject () {
    const bs = WORLD_MAP_BLOCK_SIZE / 2;

    let geometry = new THREE.CubeGeometry( bs, bs, bs );
    let material = new THREE.MeshLambertMaterial({ color: 0xffffff });
    let mesh = new THREE.Mesh( geometry, material );

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }

  /**
   * @param {THREE.Mesh} sourceObject
   * @private
   */
  _createParticle (sourceObject) {
    let particle = sourceObject.clone();
    this._pool.push( particle );
  }

  /**
   * @param {ParticlesPromise} targetPromise
   * @returns {number}
   * @private
   */
  _findPromiseIndex (targetPromise) {
    return this._promises.findIndex(promise => {
      return promise.id === targetPromise.id;
    });
  }
}
