import { EffectState } from "./effect-state";
import { ParticleSystem } from "./particle";
import { TransitionPlayback } from "./transition";
import { Game } from "../game";
import { LivingObject } from "../living-object";

let EFFECT_ID = 1;

export class Effect {

  /**
   * @type {number}
   * @private
   */
  _id = EFFECT_ID++;

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
   * @type {*}
   * @private
   */
  _options = {};

  /**
   * @type {number}
   * @private
   */
  _state = EffectState.NOT_RUNNING;

  /**
   * @type {ParticleSystem}
   * @private
   */
  _particleSystem = null;

  /**
   * @type {TransitionPlayback}
   * @private
   */
  _transition = null;

  /**
   * @type {Array<Function>}
   * @private
   */
  _onFinishedFns = [];

  init () {
    let {
      particleSystemOptions = {},
      transitionOptions
    } = this._options;

    this._particleSystem = new ParticleSystem( particleSystemOptions );

    if (this._from && this._to && transitionOptions) {
      this._transition = new TransitionPlayback( this._from, this._to, transitionOptions );
      this._transition.onFinished(_ => {
        this._particleSystem.stop();
      });
      this.scene.add( this._particleSystem );
    } else {
      if (this._to instanceof LivingObject) {
        this._to.add( this._particleSystem );
      } else {
        this.scene.add( this._particleSystem );
      }
    }
  }

  /**
   * @param {number} deltaTime
   */
  update (deltaTime) {
    if (this.isFinished) {
      return;
    }

    const transition = this._transition;
    const particleSystem = this._particleSystem;

    if (transition) {
      transition.update( deltaTime );

      if (particleSystem) {
        particleSystem.position.copy( transition.currentPosition );
        particleSystem.update( deltaTime );

        if (transition.isFinished && particleSystem.isFinished) {
          particleSystem.release();
          transition.dispose();

          this.scene.remove( particleSystem );
          this.finish();
        }
      }
    } else if (particleSystem) {
      particleSystem.update( deltaTime );

      if (particleSystem.isFinished) {
        particleSystem.release();

        this.scene.remove( particleSystem );
        this.finish();
      }
    }
  }

  start () {
    this._state = EffectState.RUNNING;

    if (this._particleSystem) {
      this._particleSystem.start();
    }
    if (this._transition) {
      this._transition.start();
    }
  }

  stop () {
    this._state = EffectState.NOT_RUNNING;

    this._transition && this._transition.finish();
    this._particleSystem && this._particleSystem.stop();
  }

  finish () {
    this._state = EffectState.FINISHED;

    for (let i = 0, length = this._onFinishedFns.length; i < length; ++i) {
      this._onFinishedFns[ i ]();
    }
  }

  /**
   * @param {Function} callback
   */
  onFinished (callback) {
    this._onFinishedFns.push( callback );
  }

  dispose () {
    this._particleSystem = null;
    this._transition = null;
    this._to = null;
    this._from = null;
    this._options = null;
    this._onFinishedFns = null;
  }

  /**
   * @param {*} options
   */
  setOptions (options) {
    this._options = options;
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
   * @returns {number}
   */
  get id () {
    return this._id;
  }

  /**
   * @returns {ParticleSystem}
   */
  get particleSystem () {
    return this._particleSystem;
  }

  /**
   * @returns {TransitionPlayback}
   */
  get transition () {
    return this._transition;
  }

  /**
   * @returns {THREE.Scene}
   */
  get scene () {
    return Game.getInstance().scene;
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
  get isStopped () {
    return this._state === EffectState.NOT_RUNNING;
  }

  /**
   * @returns {boolean}
   */
  get isFinished () {
    return this._state === EffectState.FINISHED;
  }
}
