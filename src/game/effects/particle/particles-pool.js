import { ParticlesBucket } from "./particles-bucket";
import { CubeParticle } from "./cube-particle";

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
   * @type {Array<Particle>}
   * @private
   */
  _pool = [];

  /**
   * @type {boolean}
   * @private
   */
  _poolReady = false;

  /**
   * @type {Array<ParticlesBucket>}
   * @private
   */
  _buckets = [];

  /**
   * @param {Particle} sourceObject
   */
  createPool (sourceObject = null) {
    if (this._poolReady) {
      console.warn('[Warn] Particles Pool already initialized');
    }
    this._pool = [];
    sourceObject = sourceObject || this._createSourceObject();

    for (let i = 0; i < this._poolSize; ++i) {
      this._pool.push( this._cloneParticle( sourceObject ) );
    }

    this._poolReady = true;
  }

  /**
   * @param {number} particlesNumber
   * @returns {ParticlesBucket}
   */
  take (particlesNumber = 0) {
    particlesNumber = Math.min( Math.max( particlesNumber, 0 ), this.poolFreeSize );

    if (!this._poolReady) {
      particlesNumber = 0;
    }

    // console.info(`[ParticlesPool] got ${particlesNumber} particles from the pool`);

    let particles = this._pool.splice( 0, particlesNumber );
    let bucket = new ParticlesBucket( particles );

    this._buckets.push( bucket );
    return bucket;
  }

  /**
   * @param {ParticlesBucket} particlesBucket
   */
  transfer (particlesBucket) {
    if (!particlesBucket.isReleased) {
      return particlesBucket.release();
    }

    let bucketIndex = this._findBucketIndex( particlesBucket );
    if (bucketIndex >= 0) {
      this._buckets.splice( bucketIndex, 1 );
    }

    let particles = particlesBucket.particles || [];
    this._pool = this._pool.concat( particles );
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
   * @returns {Array<ParticlesBucket>}
   */
  get buckets () {
    return this._buckets;
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
   * @returns {Particle}
   * @private
   */
  _createSourceObject () {
    const particle = new CubeParticle();
    particle.shadows = true;
    return particle;
  }

  /**
   * @param {Particle} sourceObject
   * @private
   */
  _cloneParticle (sourceObject) {
    return sourceObject.clone();
  }

  /**
   * @param {ParticlesBucket} particlesBucket
   * @returns {number}
   * @private
   */
  _findBucketIndex (particlesBucket) {
    return this._buckets.findIndex(bucket => {
      return bucket.id === particlesBucket.id;
    });
  }
}
