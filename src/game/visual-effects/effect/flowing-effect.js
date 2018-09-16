import { ParticleEffect, ParticleEffectEvents } from "./particle-effect";
import { TransitionPlayback } from "../transition/index";
import { TransitionEvents } from "../transition/transition-events";

export class FlowingEffect extends ParticleEffect {

  /**
   * @type {TransitionPlayback}
   * @private
   */
  _transition = null;

  /**
   * @type {*}
   * @private
   */
  _transitionOptions = {};

  /**
   * Initializing effect
   */
  init () {
    this.isFlowing = true;

    super.init();

    this._transition = new TransitionPlayback( this.from, this.to, this._transitionOptions );
    this._transition.once(TransitionEvents.FINISHED, _ => {
      if (this.particleSystem && this.particleSystem.isRunning) {
        this.particleSystem.stop();
      }
    });

    this.once( ParticleEffectEvents.FINISHED, _ => this.dispose() );
  }

  /**
   * @param {number} deltaTime
   */
  update (deltaTime) {
    if (this.isFinished) {
      return;
    }

    super.update( deltaTime );

    deltaTime *= this.timeScale;
    this._updateTransition( deltaTime );
  }

  start () {
    super.start();

    this._transition.start();
  }

  /**
   * Clear memory
   */
  dispose () {
    super.dispose();

    this._transition = null;
    this._transitionOptions = null;
  }

  /**
   * @param {*} options
   */
  setOptions (options) {
    let {
      transitionOptions = {}
    } = options;

    this._transitionOptions = transitionOptions;

    super.setOptions( options );
  }

  /**
   * @returns {TransitionPlayback}
   */
  get transition () {
    return this._transition;
  }

  /**
   * @param {number} deltaTime
   * @private
   */
  _updateTransition (deltaTime) {
    if (!this._transition) {
      return;
    }

    const transition = this._transition;
    transition.update( deltaTime );

    if (transition.currentPosition) {
      const particleSystem = this.particleSystem;
      particleSystem.position.copy( transition.currentPosition );
    }
  }
}
