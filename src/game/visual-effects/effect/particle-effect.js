import { EffectState } from "./effect-state";
import { Game } from "../../game";
import { LivingObject } from "../../living-object/index";
import { ParticleSystem } from "../particle/index";
import { extendDeep } from "../../utils";
import { ParticleSystemEvents } from "../particle/particle-system-events";

let EFFECT_ID = 1;

export const ParticleEffectEvents = {
  START_FINISHING: 'startFinishing',
  FINISHED: 'finished'
};

export class ParticleEffect {

  /**
   * @type {number}
   * @private
   */
  _id = EFFECT_ID++;

  /**
   * @type {number}
   * @private
   */
  _state = EffectState.PAUSED;

  /**
   * @type {*}
   * @private
   */
  _options = {};

  /**
   * @type {boolean}
   * @private
   */
  _attachedToTarget = false;

  /**
   * @type {*}
   * @private
   */
  _particleSystemOptions = {};

  /**
   * @type {LivingObject|THREE.Vector3}
   * @private
   */
  _from = null;

  /**
   * @type {LivingObject|THREE.Vector3}
   * @private
   */
  _to = null;

  /**
   * @type {ParticleSystem}
   * @private
   */
  _particleSystem = null;

  /**
   * @type {Array<Function>}
   * @private
   */
  _onFinishedFns = [];

  /**
   * @type {number}
   * @private
   */
  _duration = 0;

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
   * @type {boolean}
   * @private
   */
  _isFlowing = false;

  init () {
    this._particleSystem = new ParticleSystem( this._particleSystemOptions );

    this._particleSystem.on(ParticleSystemEvents.FINISHED, _ => {
      this._particleSystem.release();
      this.finish();
    });

    this.parentContainer.add( this._particleSystem );

    if (!this._attachedToTarget
      && !this._isFlowing && this.toPosition) {
      this._particleSystem.position.copy( this.toPosition );
    }
  }

  /**
   * @param {number} deltaTime
   */
  update (deltaTime) {
    if (this.isFinished || this.isPaused) {
      return;
    }
    deltaTime *= this._timeScale;
    this._updateParticleSystem( deltaTime );

    this._timeElapsed += deltaTime * 1000;
    this._checkDuration();
  }

  start () {
    this._state = EffectState.RUNNING;

    if (this._particleSystem) {
      this._particleSystem.start();
    }

    this._timeElapsed = 0;
  }

  pause () {
    this._state = EffectState.PAUSED;
  }

  finish () {
    this._state = EffectState.FINISHED;
    this._onFinished();
    this.dispose();
  }

  /**
   * Clear memory
   */
  dispose () {
    this._particleSystem = null;
    this._to = null;
    this._from = null;
    this._options = null;
    this._particleSystemOptions = null;
    this._onFinishedFns = null;
  }

  /**
   * @param {*} options
   */
  setOptions (options) {
    this._options = options;

    let {
      attachToTarget = false,
      duration = 0,
      timeScale = 1,
      particleSystemOptions = {}
    } = this._options;

    this._attachedToTarget = attachToTarget;
    this._duration = duration;
    this._timeScale = timeScale;
    this._particleSystemOptions = particleSystemOptions;
  }

  /**
   * @param {*} defaultOptions
   * @param {*} options
   * @returns {*}
   */
  mergeOptions (defaultOptions, options) {
    return extendDeep( defaultOptions, options );
  }

  /**
   * @param {LivingObject|THREE.Vector3} from
   */
  setFrom (from) {
    this._from = from;
  }

  /**
   * @param {LivingObject|THREE.Vector3} to
   */
  setTo (to) {
    this._to = to;
  }

  /**
   * @param {number} timeScale
   */
  setTimeScale (timeScale = 1) {
    this._timeScale = timeScale;
  }

  /**
   * @param {Function} callback
   */
  onStartFinishing (callback) {
    this._particleSystem.onStartFinishing( callback );
  }

  /**
   * @param {Function} callback
   */
  onFinished (callback) {
    this._onFinishedFns.push( callback );
  }

  /**
   * @returns {number}
   */
  get id () {
    return this._id;
  }

  /**
   * @returns {boolean}
   */
  get isFlowing () {
    return this._isFlowing;
  }

  /**
   * @param {boolean} value
   */
  set isFlowing (value) {
    this._isFlowing = value;
  }

  /**
   * @returns {ParticleSystem}
   */
  get particleSystem () {
    return this._particleSystem;
  }

  /**
   * @returns {LivingObject|THREE.Vector3}
   */
  get from () {
    return this._from;
  }

  /**
   * @returns {LivingObject|THREE.Vector3}
   */
  get fromPosition () {
    return this._from && this._from.position || this._from;
  }

  /**
   * @returns {LivingObject|THREE.Vector3}
   */
  get to () {
    return this._to;
  }

  /**
   * @returns {LivingObject|THREE.Vector3}
   */
  get toPosition () {
    return this._to && this._to.position || this._to;
  }

  /**
   * @returns {THREE.Scene}
   */
  get scene () {
    return Game.getInstance().scene;
  }

  /**
   * @returns {THREE.Scene|THREE.Object3D|*}
   */
  get parentContainer () {
    if (this._attachedToTarget && this._isFlowing) {
      console.warn(`Effect shouldn't be attached to target and flowing at once`);
    }

    return this._attachedToTarget
      && !this._isFlowing
      && this._to
      && this._to instanceof LivingObject
      ? this._to : this.scene;
  }

  /**
   * @returns {*}
   */
  get options () {
    return this._options;
  }

  /**
   * @returns {number}
   */
  get timeScale () {
    return this._timeScale;
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
  get isPaused () {
    return this._state === EffectState.PAUSED;
  }

  /**
   * @returns {boolean}
   */
  get isFinished () {
    return this._state === EffectState.FINISHED;
  }

  /**
   * @param {number} deltaTime
   * @private
   */
  _updateParticleSystem (deltaTime) {
    if (!this._particleSystem) {
      return;
    }
    const particleSystem = this._particleSystem;
    particleSystem.update( deltaTime );
  }

  /**
   * @private
   */
  _checkDuration () {
    if (!this._duration
      || !this._particleSystem) {
      return;
    }
    if (this._timeElapsed > this._duration
      && this._particleSystem.isRunning) {
      this._particleSystem.stop();
    }
  }

  /**
   * @private
   */
  _onFinished () {
    for (let i = 0, length = this._onFinishedFns.length; i < length; ++i) {
      this._onFinishedFns[ i ]();
    }
  }
}
