import { Player } from "../player";
import { PlayerCamera } from "./player-camera";
import { WORLD_MAP_BLOCK_SIZE } from "../../settings";

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

      this._mixer = new THREE.AnimationMixer( this.mesh );
      console.log('Animations:', this.mesh.geometry.animations);

      this._k = 0;
      this._mixerAction = this._mixer.clipAction( this.mesh.geometry.animations[ this._k++ ] );
      console.log(this._mixerAction);
      this._mixerAction.play();

      setInterval(_ => {
        this._mixerAction.stop();
        this._mixerAction = this._mixer.clipAction( this.mesh.geometry.animations[ this._k ] );
        this._k = (this._k + 1) % this.mesh.geometry.animations.length;
        this._mixerAction.play();
      }, 3000)
    });
  }

  update (clock) {
    if (this._k === 2) {
      this.position.z -= .2;

      let position = this.position.clone().divideScalar( WORLD_MAP_BLOCK_SIZE );
      let y = window.game.world.map.getMapHeight( position );

      this.position.y = y * WORLD_MAP_BLOCK_SIZE + 2 + .01;

      game._dirLight.position.z -= .2;
      game._dirLight.target.position.z -= .2;
    }

    this._camera && this._camera.update( clock );
    if ( this._mixer ) {
      this._mixer.update( clock.getDelta() );
    }
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
