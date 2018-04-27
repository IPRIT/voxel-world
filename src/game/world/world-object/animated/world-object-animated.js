import { WorldObjectSkinned } from "../skinned";
import { ModelType } from "../../../model";

export class WorldObjectAnimated extends WorldObjectSkinned {

  /**
   * @type {*}
   * @private
   */
  _animationMixer;

  /**
   * @type {*}
   * @private
   */
  _currentClipAction;

  /**
   * @param {object} options
   * @returns {*}
   */
  init (options = {}) {
    super.init( options );

    this._initAnimationMixer();
  }

  /**
   * @param {THREE.Clock} clock
   */
  update (clock) {
    if (this._animationMixer) {
      this._animationMixer.update( clock.getDelta() );
    }
  }

  /**
   * Runs animation sequence
   * @param {string|THREE.AnimationClip} clip
   */
  activateClipAction (clip) {
    if (!clip) {
      return console.warn('Clip action does not exist');
    } else if (this._currentClipAction === clip) {
      return;
    }
    this.stopClipAction();

    this._currentClipAction = this._animationMixer.clipAction( clip );
    this._currentClipAction.play();
  }

  /**
   * Stops current clip action
   */
  stopClipAction () {
    if (this._currentClipAction) {
      this._currentClipAction.stop();
    }
  }

  /**
   * Resumes current clip action
   */
  resumeClipAction () {
    if (this._currentClipAction) {
      this._currentClipAction.play();
    }
  }

  /**
   * Stops playing active clip action
   * and sets null to the object
   */
  resetClipAction () {
    this.stopClipAction();
    this._currentClipAction = null;
  }

  /**
   * Resets active animation mixer with actions
   */
  resetAnimationMixer () {
    this.resetClipAction();
    this._animationMixer.stopAllAction();
  }

  /**
   * @returns {THREE.AnimationMixer}
   */
  get animationMixer () {
    return this._animationMixer;
  }

  /**
   * @type {THREE.AnimationMixer} value
   */
  set animationMixer (value) {
    this._animationMixer = value;
  }

  /**
   * @returns {THREE.AnimationAction}
   */
  get currentClipAction () {
    return this._currentClipAction;
  }

  /**
   * @private
   */
  _initAnimationMixer () {
    if (this.modelType !== ModelType.SKINNED) {
      return console.warn('Only skinned models can be pass through animation mixer');
    }
    this._animationMixer = new THREE.AnimationMixer( this.mesh );
  }
}
