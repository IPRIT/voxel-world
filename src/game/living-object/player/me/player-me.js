import { NetworkPlayer } from "../../../network/player";
import { PlayerCamera } from "./player-camera";
import { PlayerWorldLight } from "./player-world-light";
import { PlayerControls } from "./player-controls";
import { AppStore } from "../../../utils/store/app-store";
import { Game } from "../../../game";

export class PlayerMe extends NetworkPlayer {

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

    return super.init( options ).then(_ => {
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
    if (this._transformControl) {
      this._transformControl.update();
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

      if (!this.targetObject) {
        livingObject.select();
        this.store.dispatch( 'game/setTarget', livingObject.objectInfo );
      }

      livingObject.setTargetLocation( this.position.clone() );
    }

    super.setTargetObject( livingObject );
  }

  resetTargetObject () {
    if (this.targetObject) {
      this.targetObject.deselect();
      this.store.dispatch( 'game/resetTarget' );
    }
    super.resetTargetObject();
  }

  jump () {
    if (!this.isJumping) {
      super.jump();
    }
  }

  attachToGameScene () {
    const game = Game.getInstance();
    this._transformControl = new THREE.TransformControls( game.activeCamera, game._renderer.domElement );
    this._transformControl.attach( this );
    game.scene.add( this._transformControl );

    super.attachToGameScene();
  }

  detachFromGameScene () {
    const game = Game.getInstance();
    if (this._transformControl) {
      game.scene.remove( this._transformControl );
    }

    super.detachFromGameScene();
  }

  /**
   * @returns {PlayerCamera}
   */
  get camera () {
    return this._camera;
  }

  /**
   * @return {AppStore}
   */
  get store () {
    return AppStore.getStore();
  }

  /**
   * @return {boolean}
   */
  get isMe () {
    return true;
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
