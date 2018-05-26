import { ParticlesPool } from "./particles-pool";

let PARTICLES_BUCKET_ID = 1;

export class ParticlesBucket {

  /**
   * @type {number}
   * @private
   */
  _id = PARTICLES_BUCKET_ID++;

  /**
   * @type {Array<Particle>}
   * @private
   */
  _particles = [];

  /**
   * @type {boolean}
   * @private
   */
  _released = false;

  /**
   * @type {boolean}
   * @private
   */
  _disposed = false;

  /**
   * @type {Array<Function>}
   * @private
   */
  _onFulfill = [];

  /**
   * @type {number}
   * @private
   */
  _timeoutMs = 100 * 1000; // todo: decrease later

  /**
   * @type {*}
   * @private
   */
  _timeout = null;

  /**
   * @param {Array<Particle>} particles
   */
  constructor (particles = []) {
    this._particles = particles;
    this._setSelfDestructTimer();
  }

  /**
   * Particles from the bucket returns back to the pool
   */
  release () {
    if (this._released) {
      return;
    }
    this.fulfill( this._particles );
    this._released = true;

    let pool = ParticlesPool.getPool();
    pool.transfer( this );

    this.dispose();
  }

  /**
   * Release and destroy the bucket
   */
  dispose () {
    if (this._disposed) {
      return;
    }
    if (!this._released) {
      this.release();
    }
    this._clearSelfDestructTimer();
    this._particles = null;
    this._onFulfill = null;
    this._disposed = true;
  }

  /**
   * @param {Function} onFulfill
   * @returns {ParticlesBucket}
   */
  beforeRelease (onFulfill) {
    this._onFulfill.push( onFulfill );
    return this;
  }

  /**
   * @param {Array<Particle>} particles
   */
  fulfill (particles) {
    let lastResult = particles;
    for (let i = 0; i < this._onFulfill.length; ++i) {
      lastResult = this._onFulfill[ i ]( lastResult );
    }
  }

  /**
   * @param {number} colorFrom
   * @param {number|*} colorTo
   */
  setHexRange (colorFrom, colorTo = colorFrom) {
    for (let i = 0; i < this._particles.length; ++i) {
      const particle = this._particles[ i ];
      if (particle) {
        particle.material.color.setHex(
          Math.abs( colorTo - colorFrom ) * Math.random() + Math.min( colorFrom, colorTo )
        )
      }
    }
  }

  /**
   * @param {THREE.Vector3} hslFrom
   * @param {THREE.Vector3} hslTo
   */
  setHSLRange (hslFrom, hslTo = hslFrom) {
    let [ h1, s1, l1 ] = [ hslFrom.x, hslFrom.y, hslFrom.z ];
    let [ h2, s2, l2 ] = [ hslTo.x, hslTo.y, hslTo.z ];
    for (let i = 0; i < this._particles.length; ++i) {
      const particle = this._particles[ i ];
      const dh = Math.abs( h2 - h1 ) * Math.random() + Math.min( h1, h2 );
      const ds = Math.abs( s2 - s1 ) * Math.random() + Math.min( s1, s2 );
      const dl = Math.abs( l2 - l1 ) * Math.random() + Math.min( l1, l2 );
      particle.material.color.setHSL( dh, ds, dl );
    }
  }

  /**
   * @returns {number}
   */
  get id () {
    return this._id;
  }

  /**
   * @returns {Array<Particle>}
   */
  get particles () {
    return this._particles;
  }

  /**
   * @returns {number}
   */
  get size () {
    return (this._particles || []).length;
  }

  /**
   * @returns {boolean}
   */
  get isReleased () {
    return this._released;
  }

  /**
   * @returns {boolean}
   */
  get isDisposed () {
    return this._disposed;
  }

  /**
   * @private
   */
  _setSelfDestructTimer() {
    this._timeout = setTimeout(_ => this.release(), this._timeoutMs);
  }

  /**
   * @private
   */
  _clearSelfDestructTimer () {
    if (this._timeout) {
      clearTimeout( this._timeout );
    }
  }
}
