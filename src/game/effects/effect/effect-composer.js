import { EffectState } from "./effect-state";

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
   * @type {Array<*>}
   * @private
   */
  _effects = [];

  /**
   * @type {Array<*>}
   * @private
   */
  _queue = [];

  /**
   * @type {Array<ParticleEffect>}
   * @private
   */
  _activeEffects = [];

  /**
   * @param {Array<{
   *  effect: ParticleEffect,
   *  effectOptions: {},
   *  delayTimeout: number,
   *  children: Array<*>
   * }>} effects
   */
  constructor (effects = []) {
    this._effects = effects;
  }

  /**
   * @param {number} deltaTime
   */
  update (deltaTime) {
    if (!this.isRunning) {
      return;
    }
    deltaTime *= this._timeScale;

    this._updateQueue();
    this._updateActiveEffects( deltaTime );

    if (this.isDone) {
      this.finish();
    }

    this._timeElapsed += deltaTime * 1000;
  }

  start () {
    this._state = EffectState.RUNNING;
    this._traverse( this._effects );
  }

  pause () {
    this._state = EffectState.PAUSED;
  }

  finish () {
    this._state = EffectState.FINISHED;

    this.dispose();
  }

  dispose () {
    this._effects = null;
    this._queue = null;
    this._activeEffects = null;
    this._from = null;
    this._to = null;
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

  /**
   * @returns {boolean}
   */
  get isDone () {
    return !this._activeEffects.length && !this._queue.length;
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
  get to () {
    return this._to;
  }

  /**
   * @param {Array<*>} effects
   * @private
   */
  _traverse (effects = []) {
    for (let i = 0; i < effects.length; ++i) {
      let {
        effect,
        effectOptions = {},
        delayTimeout = 0,
        nextImmediately = true,
        children = []
      } = effects[ i ];

      /**
       * @type ParticleEffect
       */
      let effectInstance = new effect( effectOptions );

      effectInstance.setFrom( this._from );
      effectInstance.setTo( this._to );
      effectInstance.init();

      const next = () => this._traverse( children );

      if (nextImmediately) {
        effectInstance.onStartFinishing( next );
      } else {
        effectInstance.onFinished( next );
      }

      this._addToQueue( effectInstance, this._timeElapsed + delayTimeout );
    }
  }

  /**
   * @param {ParticleEffect} effect
   * @param {number} startAt
   * @private
   */
  _addToQueue (effect, startAt) {
    this._queue.push({ startAt, effect });
  }

  /**
   * @private
   */
  _updateQueue () {
    const timeElapsed = this._timeElapsed;
    for (let i = 0, length = this._queue.length; i < length; ++i) {
      const entity = this._queue[ i ];
      if (entity.startAt <= timeElapsed) {
        this._queue.splice( i--, 1 );
        length--;
        this._startEffect( entity.effect );
      }
    }
  }

  /**
   * @param {ParticleEffect} effect
   * @private
   */
  _startEffect (effect) {
    this._activeEffects.push( effect );
    effect.start();
  }

  /**
   * @param {number} deltaTime
   * @private
   */
  _updateActiveEffects (deltaTime) {
    for (let i = 0, length = this._activeEffects.length; i < length; ++i) {
      const effect = this._activeEffects[ i ];
      effect.update( deltaTime );

      if (effect.isFinished) {
        this._activeEffects.splice( i--, 1 );
        length--;
      }
    }
  }
}
