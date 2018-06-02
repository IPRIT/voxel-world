import { FireBallEffect } from "../examples/fireball";
import { EffectState } from "./effect-state";

let effectOptions = {
  effect: FireBallEffect,
  effectOptions: {}, // override the exist effect's options

  // two options below can't be set simultaneously
  startAfterPreviousImmediately: true, // wait for stop event (before finish)
  startAfterPrevious: false, // wait for finish (after particles released)
  delayTimeout: 200, // ms, delay after previous

  absoluteStartTime: 100, // ms, start by absolute time

  onStart: () => {},
  onProgress: () => {},
  onDone: () => {},
};

export class EffectComposer {

  /**
   * @type {number}
   * @private
   */
  _timeScale = 1;

  /**
   * @type {number}
   * @private
   */
  _timeElapsed = 0;

  /**
   * @type {number}
   * @private
   */
  _state = EffectState.PAUSED;

  /**
   * @type {Array<*>}
   * @private
   */
  _effects = [];

  /**
   * @param {Array<{
   *  effect: FireBallEffect,
   *  effectOptions: {},
   *  startAfterPreviousImmediately: boolean,
   *  startAfterPrevious: boolean,
   *  delayTimeout: number,
   *  absoluteStartTime: number,
   *  onStart: Function,
   *  onProgress: Function,
   *  onDone: Function
   * }>} effects
   */
  constructor (effects = []) {
    this._effects = effects;
  }

  init () {
    // todo
  }

  update (deltaTime) {
    if (!this.isRunning) {
      return;
    }
    deltaTime *= this._timeScale;
    // todo
    this._timeElapsed += deltaTime * 1000;
  }

  start () {
    this._state = EffectState.RUNNING;
  }

  pause () {
    this._state = EffectState.PAUSED;
  }

  finish () {
    this._state = EffectState.FINISHED;
  }

  dispose () {
    this._effects = null;
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
   * @returns {boolean}
   */
  get isFinished () {
    return this._state === EffectState.FINISHED;
  }
}
