import 'bluebird';
import RendererStats from 'three-webgl-stats';
import { WORLD_MAP_BLOCK_SIZE, WORLD_MAP_SIZE } from "./settings";
import JsPerformanceStats from 'stats.js';
import { World } from "./world";
import { UpdateWarper } from "./utils/update-warper";
import { AppStore } from "./utils/store/app-store";
import { SocketManager } from "./network";
import { GameConnection } from "./network/game-connection";

export class Game {

  /**
   * @type {Game}
   * @private
   */
  static _instance = null;

  /**
   * @returns {Game}
   */
  static getInstance () {
    if (this._instance) {
      return this._instance;
    }
    return ( this._instance = new Game() );
  }

  /**
   * Private variables
   */

  /**
   * @type {Element}
   * @private
   */
  _domContainer = null;

  /**
   * @type {WebGLRenderer}
   * @private
   */
  _renderer = null;

  /**
   * @type {{antialias: boolean}}
   * @private
   */
  _rendererOptions = {
    antialias: true
  };

  /**
   * @type {THREE.Scene}
   * @private
   */
  _scene = null;

  /**
   * @type {PerspectiveCamera}
   * @private
   */
  _worldCamera = null;

  /**
   * @type {PerspectiveCamera}
   * @private
   */
  _activeCamera = null;

  /**
   * @type {number}
   * @private
   */
  _screenWidth = window.innerWidth;

  /**
   * @type {number}
   * @private
   */
  _screenHeight = window.innerHeight;

  /**
   * Camera settings
   */
  /**
   * @type {number}
   * @private
   */
  _fov = 60;

  /**
   * @type {number}
   * @private
   */
  _aspect = this._screenWidth / this._screenHeight;

  /**
   * @type {number}
   * @private
   */
  _near = WORLD_MAP_BLOCK_SIZE;

  /**
   * @type {number}
   * @private
   */
  _far = 1000 * WORLD_MAP_BLOCK_SIZE;

  /**
   * @type {THREE.Clock}
   * @private
   */
  _clock = null;

  /**
   * @type {null}
   * @private
   */
  _stats = null;

  /**
   * @type {*}
   * @private
   */
  _animationFrameId = null;

  /**
   * @type {boolean}
   * @private
   */
  _pauseToken = false;

  /**
   * Initialize a game
   */
  init () {
    this._clock = new THREE.Clock( true );
    this._stats = this._initStats();

    this._initRenderer();
    this._attachToDom();
    this._initScene();
    this._initFog();
    this._attachEventListeners();
    this._addWorldLight();
    this._initWorld();

    this._updateWarper = new UpdateWarper( 60, 1 );
    this._updateWarper.onUpdate(deltaTime => {
      // this.world.update( deltaTime );
    });

    const socketManager = SocketManager.getManager();
    let gui = new dat.GUI();
    let common = gui.addFolder('Common');
    common.add(this._updateWarper, 'timeScale', -.5, 5);

    let socketFolder = gui.addFolder('Network');
    socketFolder.add(socketManager.socket, 'connect');
    socketFolder.add(socketManager, 'disconnect');

    document.querySelector('.dg.ac').addEventListener('mousedown', ev => {
      ev.stopPropagation();
    });
  }

  /**
   * Update cycle
   */
  update () {
    const deltaTime = this._clock.getDelta();
    this.world.update( deltaTime );

    // update renderer stats
    this._renderStats.update( this._renderer );
  }

  /**
   * Render cycle
   */
  render () {
    this._renderer.render( this._scene, this.activeCamera );
  }

  /**
   * Start the application
   */
  start () {
    this._clock.start();
    this._animate();
  }

  /**
   * Pause the application
   */
  pause () {
    this._clock.stop();
    this._pauseToken = true;
  }

  /**
   * @return {Promise<*>}
   */
  connect () {
    const vuexStore = AppStore.getStore();
    const gameServer = vuexStore.state.game.server;
    const gameConnection = GameConnection.getConnection();
    return gameConnection.connect( gameServer );
  }

  /**
   * Disconnects from the server
   */
  disconnect () {
    const gameConnection = GameConnection.getConnection();
    return gameConnection.disconnect();
  }

  /**
   * @returns {World}
   */
  get world () {
    return this._world;
  }

  /**
   * @returns {WorldMap}
   */
  get map () {
    return this.world.map;
  }

  /**
   * @returns {THREE.Scene}
   */
  get scene () {
    return this._scene;
  }

  /**
   * @returns {PerspectiveCamera}
   */
  get activeCamera () {
    return this._activeCamera;
  }

  /**
   * @param {PerspectiveCamera} camera
   */
  set activeCamera (camera) {
    this._activeCamera = camera;
  }

  /**
   * @private
   */
  _animate () {
    if (this._pauseToken) {
      return;
    }
    this._animationFrameId = requestAnimationFrame( this._animate.bind( this ) );
    this.render();
    this.update();
  }

  /**
   * @private
   */
  _initRenderer () {
    this._renderer = new THREE.WebGLRenderer( this._rendererOptions );
    this._renderer.setSize( this._screenWidth, this._screenHeight );
    this._renderer.setPixelRatio( window.devicePixelRatio );
    // this._renderer.setPixelRatio( .7 ); // for low performance devices
    this._renderer.shadowMap.enabled = true;
    this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this._renderer.setClearColor( 0xFFA1C1, 1 );
  }

  /**
   * @private
   */
  _attachToDom () {
    // insert in DOM
    this._domContainer = document.querySelector('.game-scene');
    this._domContainer.appendChild( this._renderer.domElement );

    this._renderer.domElement.setAttribute('tabIndex', '0');
    this._renderer.domElement.focus();
  }

  /**
   * @private
   */
  _initScene () {
    this._scene = new THREE.Scene();

    this.activeCamera = this._worldCamera = new THREE.PerspectiveCamera(this._fov, this._aspect, this._near, this._far);
    this._worldCamera.position.set(
      WORLD_MAP_SIZE / 2 * WORLD_MAP_BLOCK_SIZE, 250 * WORLD_MAP_BLOCK_SIZE, WORLD_MAP_SIZE / 2 * WORLD_MAP_BLOCK_SIZE
    );
    this._worldCamera.lookAt(
      WORLD_MAP_SIZE / 2 * WORLD_MAP_BLOCK_SIZE, 0, WORLD_MAP_SIZE / 2 * WORLD_MAP_BLOCK_SIZE
    );

    this._scene.add( this._worldCamera );
  }

  /**
   * @private
   */
  _initFog () {
    // this._scene.fog = new THREE.Fog(0xffa1c1, 50 * WORLD_MAP_BLOCK_SIZE, 600 * WORLD_MAP_BLOCK_SIZE);
  }

  /**
   * @private
   */
  _addWorldLight () {
    const ambientLight = new THREE.AmbientLight( 0xf794ab );
    this._scene.add( ambientLight );

    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x000000, 0.6 );
    const bs = WORLD_MAP_BLOCK_SIZE;

    hemiLight.position.set(
      WORLD_MAP_SIZE / 2 * bs,
      300 * WORLD_MAP_BLOCK_SIZE,
      WORLD_MAP_SIZE / 2 * bs
    );

    const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 50);
    this._scene.add(hemiLight, hemiLightHelper);
  }

  /**
   * @private
   */
  _initWorld () {
    this._world = new World();
    this._world.init();
  }

  /**
   * @private
   */
  _attachEventListeners () {
    window.addEventListener( 'resize', this._onWindowResize.bind(this), false );
  }

  /**
   * @returns {*}
   * @private
   */
  _initStats () {
    const stats = new JsPerformanceStats();
    stats.showPanel( 0 );
    document.body.appendChild( stats.dom );
    requestAnimationFrame( animate );

    function animate() {
      stats.begin();
      stats.end();
      requestAnimationFrame( animate );
    }

    this._renderStats = new RendererStats();
    this._renderStats.domElement.style.position = 'absolute';
    this._renderStats.domElement.style.left = '0px';
    this._renderStats.domElement.style.bottom = '0px';
    document.body.appendChild( this._renderStats.domElement );

    return stats;
  }

  /**
   * @private
   */
  _onWindowResize (ev) {
    this._screenWidth = window.innerWidth;
    this._screenHeight = window.innerHeight;
    this._activeCamera.aspect = this._screenWidth / this._screenHeight;
    this._activeCamera.updateProjectionMatrix();

    this._renderer.setSize( this._screenWidth, this._screenHeight );
  }
}
