import Promise from 'bluebird';
import { Player } from "../player";
import { PlayerCamera } from "./player-camera";
import { WORLD_MAP_BLOCK_SIZE } from "../../settings";
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
    await Promise.resolve().delay(4000);
    await super.init(options);
  }

  update (clock) {
    super.update( clock );

    let position = this.position.clone().divideScalar( WORLD_MAP_BLOCK_SIZE );
    let y = window.game.world.map.getMapHeight( position );

    this.position.z -= .2;
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
    // todo
  }
}
