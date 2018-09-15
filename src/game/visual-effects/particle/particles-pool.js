import { ParticlesBucket } from "./particles-bucket";
import { CubeParticle } from "./cube-particle";
import { ParticlesBucketEvents } from "./particles-bucket-events";

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
      return console.warn('[Warn] Particles Pool already initialized');
    }
    this._pool = [];

    for (let i = 0; i < this._poolSize; ++i) {
      this._pool.push(
        sourceObject && sourceObject.clone() || this._createSourceObject()
      );
    }

    this._poolReady = true;
  }

  /**
   * @param {number} particlesNumber
   * @returns {ParticlesBucket}
   */
  take (particlesNumber = 0) {
    console.log( `[ParticlesPool#take] requesting ${particlesNumber} particles...` );
    particlesNumber = Math.min( Math.max( particlesNumber, 0 ), this.poolFreeSize );

    if (!this._poolReady) {
      particlesNumber = 0;
    }

    let particles = this._pool.splice( 0, particlesNumber );
    let bucket = new ParticlesBucket( particles );

    bucket.once(ParticlesBucketEvents.RELEASED, _ => this.transfer( bucket ));

    this._buckets.push( bucket );

    console.log( `[ParticlesPool#take] took ${particlesNumber} particles. Bucket ID: #${bucket.id}.` );

    return bucket;
  }

  /**
   * @param {ParticlesBucket} particlesBucket
   */
  transfer (particlesBucket) {
    console.log( `[ParticlesPool#transfer] transferring...` );

    let bucketIndex = this._findBucketIndex( particlesBucket );
    if (bucketIndex >= 0) {
      this._buckets.splice( bucketIndex, 1 );
    }

    let particles = particlesBucket.particles || [];
    this._pool = this._pool.concat( particles );

    console.log( `[ParticlesPool#transfer] transferred ${particles.length}.` );
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
