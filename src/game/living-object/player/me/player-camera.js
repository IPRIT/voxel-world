import { Game } from "../../../game";

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
    const game = Game.getInstance();
    super( game._fov, game._aspect, game._near, game._far );
    this._me = player;

    this.target = new THREE.Object3D();
  }

  /**
   * Update loop
   */
  update () {
    this._orbitControls.update();
  }

  /**
   * Inits camera position for player
   */
  initStartPosition () {
    this.position.set(0, 70, 80);
  }

  /**
   * Inits orbit camera for player
   */
  initOrbitControls () {
    const game = Game.getInstance();
    this._orbitControls = new THREE.OrbitControls(this, game._renderer.domElement);
    this._orbitControls.target = this.target.position;
    this._orbitControls.enableKeys = false;
    this._orbitControls.enablePan = false;
    this._orbitControls.enableDamping = true;
    this._orbitControls.zoomSpeed = 2;
    this._orbitControls.dampingFactor = .3;
    this._orbitControls.rotateSpeed = .4;
    this._orbitControls.maxPolarAngle = Math.PI / 2 + .01;
    this._orbitControls.mouseButtons = { ORBIT: THREE.MOUSE.RIGHT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.LEFT };

    this.update();
  }

  /**
   * Makes camera active for current scene
   */
  makeActive () {
    let game = Game.getInstance();
    game.activeCamera = this;
  }

  /**
   * Centering target camera's position to center of body
   */
  targetCenter () {
    this.target.position.set(0, this._me.objectHeight / 2, 0);
  }

  /**
   * @returns {THREE.Vector3}
   */
  get cameraDirection () {
    return this.target.position.clone().sub( this.position ).normalize();
  }
}
