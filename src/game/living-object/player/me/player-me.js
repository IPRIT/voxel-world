import { Player } from "../player";
import { PlayerCamera } from "./player-camera";
import { PlayerWorldLight } from "./player-world-light";
import { PlayerControls } from "./player-controls";
import { DamageQueue } from "../../utils/damage";
import { AppStore } from "../../../utils/store/app-store";
import { Game } from "../../../game";
import { GameConnection } from "../../../network/game-connection";
import { PlayerEvents } from "../../../network/events";
import { throttle } from "../../../../util/common-utils";
import { floorVector } from "../../../utils";

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
   * @type {Function}
   * @private
   */
  _sendTargetLocationDebounced = throttle( this._sendTargetLocation.bind( this ), 250 );

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

    let damageQueue = DamageQueue.getQueue();
    damageQueue.update( deltaTime );
  }

  /**
   * @param {THREE.Vector3} location
   * @param {boolean} isInfinite
   */
  setTargetLocation (location, isInfinite = false) {
    super.setTargetLocation( location, isInfinite );

    this._sendTargetLocationDebounced();
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
      this.socket.emit( PlayerEvents.SET_TARGET_OBJECT, livingObject.id );
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

      this.socket.emit( PlayerEvents.JUMP );
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
   * @returns {GameConnection}
   */
  get connection () {
    return GameConnection.getConnection();
  }

  /**
   * @returns {Socket}
   */
  get socket () {
    return this.connection.socket;
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

  /**
   * @private
   */
  _sendTargetLocation () {
    let target = this.targetLocation.clone();
    if (this.targetLocationInfinite) {
      target = floorVector( target.normalize(), 8 );
    } else {
      target = floorVector( target, 5 );
    }
    this.socket.emit( PlayerEvents.SET_TARGET_LOCATION, target.toArray(), this.targetLocationInfinite );
  }
}
