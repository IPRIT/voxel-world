import { ParticlesPool } from "./particles-pool";

let PARTICLES_BUCKET_ID = 1;

export class ParticlesBucket {

  /**
   * @type {number}
   * @private
   */
  _id = PARTICLES_BUCKET_ID++;

  /**
   * @type {Array<THREE.Mesh>}
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
  _timeoutMs = 5000 * 1000; // todo: decrease later

  /**
   * @type {*}
   * @private
   */
  _timeout = null;

  /**
   * @param {Array<THREE.Mesh>} particles
   */
  constructor (particles = []) {
    this._particles = particles;
    this._setSelfDestructTimer();
  }

  release () {
    if (this._released) {
      return;
    }

    this._released = true;
    let pool = ParticlesPool.getPool();
    pool.transfer( this );

    this.fulfill( this._particles );
    this.dispose();
  }

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
  onRelease (onFulfill) {
    this._onFulfill.push( onFulfill );
    return this;
  }

  /**
   * @param {THREE.Mesh[]} particles
   */
  fulfill (particles) {
    let lastResult = particles;
    for (let i = 0; i < this._onFulfill.length; ++i) {
      lastResult = this._onFulfill[ i ]( lastResult );
    }
  }

  /**
   * @returns {number}
   */
  get id () {
    return this._id;
  }

  /**
   * @returns {Array<THREE.Mesh>}
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
