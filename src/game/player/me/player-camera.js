const OrbitControls = require('three-orbit-controls')(THREE);

export class PlayerCamera extends THREE.PerspectiveCamera {

  /**
   * @type {OrbitControls}
   * @private
   */
  _orbitControls = null;

  constructor () {
    super( game._fov, game._aspect, game._near, game._far );
  }

  update () {
    this._orbitControls.target = this.target.position;
    this._orbitControls.update();
  }

  initStartPosition () {
    // todo
  }

  initOrbitControls () {
    this._orbitControls = new OrbitControls(this, game._renderer.domElement);
    this._orbitControls.target = this.target.position;
    this._orbitControls.enableKeys = false;
    this._orbitControls.enablePan = false;
    this._orbitControls.zoomSpeed = 2;
    this._orbitControls.maxPolarAngle = Math.PI / 2;
    this._orbitControls.mouseButtons = { ORBIT: THREE.MOUSE.RIGHT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.LEFT };
    this.update();
  }

  makeActive () {
    game._activeCamera = this;
  }

  /**
   * @param {THREE.Object3D} target
   */
  setTarget (target) {
    this.target = target;
  }
}
