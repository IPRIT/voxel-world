import { Vox } from "./vox";
const OrbitControls = require('three-orbit-controls')(THREE);
import JsPerformanceStats from 'stats.js';
import { Polygon } from "./polygon";
import { World, WORLD_BLOCK_SIZE, WORLD_SIZE } from "./world";

export default class Game {

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
   * @type {THREE.OrbitControls}
   * @private
   */
  _orbitControls = null;

  /**
   * @type {Scene}
   * @private
   */
  _scene = null;

  /**
   * @type {PerspectiveCamera}
   * @private
   */
  _camera = null;

  _rollOverMesh = null;

  _screenWidth = window.innerWidth;
  _screenHeight = window.innerHeight;

  /**
   * Camera settings
   */
  _fov = 60;
  _aspect = this._screenWidth / this._screenHeight;
  _near = 1;
  _far = 3000;

  _invertedMaxFps = 1 / 60;

  _clock = null;
  _stats = null;

  _animationFrameId = null;
  _pauseOpaqueToken = false;

  constructor () {
    this._init();
  }

  start () {
    this._animate();
  }

  pause () {
    this._pauseOpaqueToken = true;
  }

  _animate () {
    if (this._pauseOpaqueToken) {
      return;
    }
    this._animationFrameId = requestAnimationFrame(this._animate.bind(this));
    this._render();
    this._update();
  }

  _render () {
    this._renderer.render(this._scene, this._camera);
  }

  _update () {
    this._theta = this._theta || 0;
    this._theta += .01;

    // this._camera.position.z = Math.sin(this._theta) * 30;
    // this._camera.position.x = Math.cos(this._theta) * 30;

    // this._camera.lookAt(this._rollOverMesh.position);
  }

  _init () {
    this._clock = new THREE.Clock();
    this._stats = this._initStats();

    this._initRenderer();
    this._initScene();
    this._initFog();
    this._initGridHelper();
    this._initEventListeners();

    this._addLights();
    this._addObjects();

    this._initWorld();
  }

  _initRenderer () {
    this._renderer = new THREE.WebGLRenderer(this._rendererOptions);
    this._renderer.setSize(this._screenWidth, this._screenHeight);
    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.shadowMap.enabled = true;
    this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this._renderer.setClearColor(0xFFA1C1, 1);

    // insert in DOM
    this._domContainer = document.querySelector('.game-scene');
    this._domContainer.appendChild(this._renderer.domElement);
  }

  _initScene () {
    this._scene = new THREE.Scene();

    this._camera = new THREE.PerspectiveCamera(this._fov, this._aspect, this._near, this._far);
    this._camera.position.set( 26.03733840003578, 191.62122206489542, 46.682902241965227 );
    this._orbitControls = new OrbitControls(this._camera, this._renderer.domElement);
    this._orbitControls.target = new THREE.Vector3(WORLD_SIZE / 2, 0, WORLD_SIZE / 2);
    this._orbitControls.update();

    this._scene.add(this._camera);
  }

  _initFog () {
    this._scene.fog = new THREE.Fog(0xffa1c1, 100, 1000);
  }

  _initGridHelper () {
    this._gridHelper = new THREE.GridHelper(WORLD_SIZE, WORLD_SIZE / WORLD_BLOCK_SIZE, 0x666666, 0x999999);
    this._gridHelper.position.set(WORLD_SIZE / 2, 0, WORLD_SIZE / 2);
    this._scene.add(
      this._gridHelper
    );
  }

  _addLights () {
    const ambientLight = new THREE.AmbientLight( 0xEEB1C6 );
    this._scene.add( ambientLight );

    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.4 );
    hemiLight.color.setHSL( 0.6, 1, 0.6 );
    hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
    hemiLight.position.set( 0, 500, 0 );
    this._scene.add( hemiLight );

    const dirLight = new THREE.DirectionalLight( 0x999999, .5 );
    dirLight.color.setHSL( 0.1, 1, 0.95 );
    dirLight.position.set(WORLD_SIZE / 2, 20, WORLD_SIZE / 2);
    dirLight.position.multiplyScalar( 10 );

    const dirLightHelper = new THREE.CameraHelper( dirLight.shadow.camera );
    this._scene.add( dirLight, dirLightHelper );

    dirLight.castShadow = true;

    dirLight.shadow.mapSize.width = 1 << 11;
    dirLight.shadow.mapSize.height = 1 << 11; // 2048

    const offset = 350;

    dirLight.shadow.camera.top = offset;
    dirLight.shadow.camera.right = offset;
    dirLight.shadow.camera.bottom = -offset;
    dirLight.shadow.camera.left = -offset;

    dirLight.shadow.camera.far = 3500;
    dirLight.shadow.camera.bias = -0.0001;
    dirLight.shadow.camera.darkness = 0.45;
  }

  async _addObjects () {
    const polygon = new Polygon(this);
    const vox = new Vox();

    // console.log(await vox.loadVoxData('/resources/models/vox-test.vox'));
    // console.log(await vox.loadVoxData('/resources/models/deer-test.vox'));

    const map = await vox.loadVoxData('/resources/models/map-test.vox');

    polygon.debugVoxModel(map);
  }

  _initWorld () {
    this._world = new World(this);
    this._world.init();
  }

  _initEventListeners () {
    window.addEventListener( 'resize', this._onWindowResize.bind(this), false );
  }

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

    return stats;
  }

  _onWindowResize() {
    this._screenWidth = window.innerWidth;
    this._screenHeight = window.innerHeight;
    this._camera.aspect = this._screenWidth / this._screenHeight;
    this._camera.updateProjectionMatrix();

    this._renderer.setSize( this._screenWidth, this._screenHeight );
  }
}
