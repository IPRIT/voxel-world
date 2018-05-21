import { ParticlesPool } from "./particles-pool";

let PARTICLES_PROMISE_ID = 1;

export class ParticlesPromise {

  /**
   * @type {number}
   * @private
   */
  _id = PARTICLES_PROMISE_ID++;

  /**
   * @type {Array<THREE.Mesh>}
   * @private
   */
  _particles = [];

  /**
   * @type {boolean}
   * @private
   */
  _resolved = false;

  /**
   * @type {Array<Function>}
   * @private
   */
  _onFulfill = [];

  /**
   * @type {number}
   * @private
   */
  _timeoutMs = 100 * 1000;

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

  resolve () {
    if (this._resolved) {
      return;
    }
    this._resolved = true;
    let pool = ParticlesPool.getPool();
    pool.transfer( this );

    this._clearSelfDestructTimer();
  }

  dispose () {
    if (!this._resolved) {
      this.resolve();
    }
    this._particles = null;
  }

  /**
   * @param {Function} onFulfill
   * @returns {ParticlesPromise}
   */
  then (onFulfill) {
    this._onFulfill.push( onFulfill );
    return this;
  }

  /**
   * @param {THREE.Mesh[]} particles
   */
  onFulfill (particles) {
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
   * @private
   */
  _setSelfDestructTimer() {
    this._timeout = setTimeout(_ => this.dispose(), this._timeoutMs);
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
