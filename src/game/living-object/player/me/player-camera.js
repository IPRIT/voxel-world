const OrbitControls = require('three-orbit-controls')(THREE);

THREE.OrbitControls = OrbitControls;

export class PlayerCamera extends THREE.PerspectiveCamera {

  /**
   * @type {PlayerMe}
   * @private
   */
  _me = null;

  /**
   * @type {THREE.OrbitControls}
   * @private
   */
  _orbitControls = null;

  /**
   * @param {PlayerMe} player
   */
  constructor (player) {
    super( game._fov, game._aspect, game._near, game._far );
    this._me = player;

    let targetObject = new THREE.Object3D();
    targetObject.position.set(0, 3, 0);
    this.target = targetObject;
  }

  update () {
    this._orbitControls.update();
  }

  initStartPosition () {
    this.position.set(0, 370, 480);
  }

  initOrbitControls () {
    this._orbitControls = new THREE.OrbitControls(this, game._renderer.domElement);
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
}
