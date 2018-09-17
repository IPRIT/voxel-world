import EventEmitter from 'eventemitter3';
import { EffectState } from "./effect-state";
import { ParticleEffectEvents } from "./particle-effect";
import { SkillStructure } from "../skills/skill";

export const EffectComposerEvents = {
  STARTED: 'started',
  PAUSED: 'paused',
  FINISHED: 'finished'
};

export class EffectComposer extends EventEmitter {

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
   * @type {SkillStructure|Array<*>}
   * @private
   */
  _effectStructure = [];

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
   * @param {
   * SkillStructure|Array<{
   *  effect: ParticleEffect,
   *  effectOptions: {},
   *  delayTimeout: number,
   *  nextImmediately: boolean,
   *  children: Array<*>
   * }>} structure
   */
  constructor (structure = []) {
    super();
    this._effectStructure = structure;
  }

  init () {
    let structure = this._effectStructure;
    if (this._effectStructure instanceof SkillStructure) {
      structure = this._effectStructure.structure;
    }
    this._traverse( structure );
  }

  /**
   * @param {number} deltaTime
   */
  update (deltaTime) {
    if (this.isFinished || this.isPaused) {
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
    this.emit( EffectComposerEvents.STARTED );
  }

  pause () {
    this._state = EffectState.PAUSED;
    this.emit( EffectComposerEvents.PAUSED );
  }

  finish () {
    this._state = EffectState.FINISHED;
    this.emit( EffectComposerEvents.FINISHED );

    this.dispose();
  }

  dispose () {
    this._effectStructure = null;
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
    return !this._activeEffects
      || !this._queue
      || !this._activeEffects.length && !this._queue.length;
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

      effectInstance.on(ParticleEffectEvents.FINISHED, _ => this._onEffectFinished( effectInstance ));

      const next = () => this._traverse( children );

      const nextTriggerEvent = nextImmediately
        ? ParticleEffectEvents.FINISHING
        : ParticleEffectEvents.FINISHED;

      effectInstance.on( nextTriggerEvent, next );

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
    this._activeEffects.forEach(effect => effect.update( deltaTime ));
  }

  /**
   * @param {ParticleEffect} targetEffect
   * @private
   */
  _onEffectFinished (targetEffect) {
    if (!targetEffect) {
      return;
    }

    const indexToDelete = this._activeEffects.findIndex(effect => {
      return effect.id === targetEffect.id;
    });

    if (indexToDelete >= 0) {
      this._activeEffects.splice( indexToDelete, 1 );
    }
  }
}
