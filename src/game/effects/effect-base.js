import { EffectState } from "./effect-state";

export class EffectBase {

  /**
   * Uses to set time direction and scale
   * Default is 1 - default velocity
   *
   * @type {number}
   * @private
   */
  _timeScale = 1;

  /**
   * @type {number}
   * @private
   */
  _state = EffectState.PAUSED;

  /**
   * @type {number}
   * @private
   */
  _velocity = 1;

  /**
   * @type {LivingObject}
   * @private
   */
  _fromObject = null;

  /**
   * @type {LivingObject}
   * @private
   */
  _toObject = null;

  /**
   * @param {LivingObject} fromObject
   * @param {LivingObject} toObject
   * @param {*} options
   */
  constructor (fromObject, toObject, options = {}) {
    this._fromObject = fromObject;
    this._toObject = toObject;
    this._initOptions( options );
  }

  start () {
    this._state = EffectState.RUNNING;
  }

  /**
   * @param {number} deltaTime
   */
  update (deltaTime) {
    if (this.isPaused) {
      return;
    }
  }

  pause () {
    this._state = EffectState.PAUSED;
  }

  stop () {
  }

  reset () {
  }

  /**
   * @param {number} timeScale
   */
  setTimeScale (timeScale) {
    this._timeScale = timeScale;
  }

  /**
   * @param {number} velocity
   */
  setVelocity (velocity) {
    this._velocity = velocity;
  }

  /**
   * @returns {number}
   */
  get timeScale () {
    return this._timeScale;
  }

  /**
   * @returns {number}
   */
  get velocity () {
    return this._velocity * this._timeScale;
  }

  /**
   * @returns {boolean}
   */
  get isPaused () {
    return this._state === EffectState.PAUSED;
  }

  /**
   * @returns {boolean}
   */
  get isRunning () {
    return this._state === EffectState.RUNNING;
  }

  /**
   * @param {*} options
   * @private
   */
  _initOptions (options) {
    let { timeScale, velocity } = options;
    this._timeScale = timeScale;
    this._velocity = velocity;
  }
}
