export class UpdateWarper {

  /**
   * @type {number}
   * @private
   */
  _timeElapsed = 0;

  /**
   * @type {number}
   * @private
   */
  _timeScale = 1;

  /**
   * @type {number}
   * @private
   */
  _updateInvokes = 0;

  /**
   * @type {number}
   * @private
   */
  _updatesPerSecond = 60;

  /**
   * @type {number}
   * @private
   */
  _lastUpdateAt = 0;

  /**
   * @type {Array<Function>}
   * @private
   */
  _updateFns = [];

  /**
   * @type {boolean}
   * @private
   */
  _paused = false;

  /**
   * @param {number} updatesPerSecond
   * @param {number} timeScale
   */
  constructor (updatesPerSecond = 60, timeScale = 1) {
    this._updatesPerSecond = Math.min( 60, Math.max( 1e-8, updatesPerSecond ) );
    this._timeScale = timeScale;
  }

  /**
   * @param {number} deltaTime
   */
  update (deltaTime) {
    if (this._paused) {
      return;
    }
    this._timeElapsed += deltaTime;
    const desiredInvokes = Math.floor( this._updatesPerSecond * this._timeElapsed );
    const needToInvoke = desiredInvokes - this._updateInvokes;

    if (needToInvoke <= 0) {
      return;
    }

    this._invokeUpdate( (this._timeElapsed - this._lastUpdateAt) * this._timeScale );
    this._updateInvokes += needToInvoke;
    this._lastUpdateAt = this._timeElapsed;
  }

  /**
   * Function to call each update
   *
   * @param {Function} fn
   */
  onUpdate (fn = () => {}) {
    this._updateFns.push( fn );
  }

  /**
   * Disposes the instance
   */
  dispose () {
    this._paused = true;
    this._updateFns = null;
  }

  /**
   * @returns {boolean}
   */
  get isPaused () {
    return this._paused;
  }

  /**
   * @returns {boolean}
   */
  get isRunning () {
    return !this._paused;
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
   * @param {number} deltaTime
   * @private
   */
  _invokeUpdate (deltaTime) {
    this._updateInvokes++;

    if (!this._updateFns || !this._updateFns.length) {
      return;
    }

    for (let i = 0, length = this._updateFns.length; i < length; ++i) {
      this._updateFns[ i ]( deltaTime );
    }
  }
}
