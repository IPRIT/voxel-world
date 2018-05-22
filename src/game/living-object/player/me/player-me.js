import { Player } from "../player";
import { PlayerCamera } from "./player-camera";
import { PlayerWorldLight } from "./player-world-light";
import { PlayerControls } from "./player-controls";
import { TransitionPlayback } from "../../../effects";
import { Game } from "../../../game";

export class PlayerMe extends Player {

  /**
   * @type {PlayerCamera}
   * @private
   */
  _camera = null;

  /**
   * @type {PlayerWorldLight}
   * @private
   */
  _light = null;

  /**
   * @type {PlayerControls}
   * @private
   */
  _controls = null;

  /**
   * @param options
   * @returns {*}
   */
  async init (options = {}) {
    this._initCamera();
    this._initLights();
    this._initControls();
    return super.init(options).then(_ => {
      this._camera.targetCenter();
    });
  }

  /**
   * @param {number} deltaTime
   */
  update (deltaTime) {
    super.update( deltaTime );

    if (this._controls) {
      this._controls.update( deltaTime );
    }
    if (this._camera) {
      this._camera.update();
    }
    if (this._light) {
      this._light.update();
    }
  }

  /**
   * @param {LivingObject} livingObject
   */
  setTargetObject (livingObject) {
    if (livingObject) {
      if (this.targetObject && livingObject.id !== this.targetObject.id) {
        this.resetTargetObject();
      }
      livingObject.select();
    }
    super.setTargetObject( livingObject );
  }

  resetTargetObject () {
    if (this.targetObject) {
      this.targetObject.deselect();
    }
    super.resetTargetObject();
  }

  jump () {
    if (!this.isJumping) {
      super.jump();
    }
  }

  /**
   * @returns {PlayerCamera}
   */
  get camera () {
    return this._camera;
  }

  /**
   * @returns {PlayerCamera}
   * @private
   */
  _initCamera () {
    this._camera = new PlayerCamera( this );
    this._camera.initOrbitControls();
    this._camera.initStartPosition();
    this._camera.makeActive();

    this.add( this._camera );

    return this._camera;
  }

  /**
   * @returns {PlayerWorldLight}
   * @private
   */
  _initLights () {
    this._light = new PlayerWorldLight( this, 0x999999, .4 );
    this._light.init();
    this._light.attachToWorld();

    return this._light;
  }

  /**
   * @private
   */
  _initControls () {
    this._controls = new PlayerControls( this );
    this._controls.init();
  }
}
