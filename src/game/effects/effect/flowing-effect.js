import { ParticleEffect } from "./particle-effect";
import { TransitionPlayback } from "../transition/index";

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

  init () {
    super.init();

    this._transition = new TransitionPlayback( this.from, this.to, this._transitionOptions );
    this._transition.onFinished(_ => {
      if (this.particleSystem) {
        this.particleSystem.isRunning && this.particleSystem.stop();
      }
    });
  }

  /**
   * @param {number} deltaTime
   */
  update (deltaTime) {
    if (this.isFinished || this.isPaused) {
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

    this._transition && this._transition.dispose();
    this._transition = null;
    this._transitionOptions = null;
  }

  /**
   * @param {*} options
   */
  setOptions (options) {
    super.setOptions( options );

    let {
      transitionOptions = {}
    } = this.options;

    this._transitionOptions = transitionOptions;
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

    const particleSystem = this.particleSystem;
    particleSystem.position.copy( transition.currentPosition );

    if (transition.isFinished) {
      transition.dispose();
      this._transition = null;
    }
  }
}
