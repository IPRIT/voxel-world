import Promise from 'bluebird';
import { Player } from "../player";
import { PlayerCamera } from "./player-camera";
import { WORLD_MAP_BLOCK_SIZE } from "../../../settings";
import { PlayerWorldLight } from "./player-world-light";

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
   * @param options
   * @returns {*}
   */
  async init (options = {}) {
    this._initCamera();
    this._initLights();
    this._initControls();
    await Promise.resolve().delay(0);
    return super.init(options);
  }

  /**
   * @param {number} deltaTimeMs
   */
  update (deltaTimeMs) {
    super.update( deltaTimeMs );

    let position = this.position.clone().divideScalar( WORLD_MAP_BLOCK_SIZE );
    let y = window.game.world.map.getMapHeight( position );

    let delta = deltaTimeMs * 1000;
    let desiredDelta = 1000 / 60;
    this.position.z -= (delta * .2) / desiredDelta;
    this.position.y = y * WORLD_MAP_BLOCK_SIZE + 2 + .01;

    if (this._camera) {
      this._camera.update();
    }
    if (this._light) {
      this._light.update();
    }
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
    this._light = new PlayerWorldLight( this, 0xEEB1C6, .5 );
    this._light.init();
    this._light.attachToWorld();

    return this._light;
  }

  /**
   * @private
   */
  _initControls () {
    // todo
  }
}
