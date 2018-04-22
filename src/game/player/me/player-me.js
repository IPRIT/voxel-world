import { Player } from "../player";
import { PlayerCamera } from "./player-camera";
import { WORLD_MAP_BLOCK_SIZE } from "../../world/map/world-map";

export class PlayerMe extends Player {

  /**
   * @type {PlayerCamera}
   * @private
   */
  _camera = null;

  constructor () {
    super();
  }

  init (options = {}) {
    return super.init(options).then(_ => {
      this._initCamera();
    });
  }

  update () {
    this._camera && this._camera.update();
  }

  _initCamera () {
    this._camera = new PlayerCamera();
    let targetObject = new THREE.Object3D();
    targetObject.position.set(0, 3, 0);
    this._camera.setTarget( targetObject );
    this._camera.initOrbitControls();
    this.add( this._camera );
    this._camera.makeActive();
  }
}
