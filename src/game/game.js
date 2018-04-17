import { WORLD_MAP_BLOCK_SIZE, WORLD_MAP_SIZE } from "./world/world-map";
import JsPerformanceStats from 'stats.js';
import { World } from "./world";

const OrbitControls = require('three-orbit-controls')(THREE);

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
   * @type {THREE.Scene}
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
  _near = 1 * WORLD_MAP_BLOCK_SIZE;
  _far = 3000 * WORLD_MAP_BLOCK_SIZE;

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

  /**
   * @returns {World}
   */
  get world () {
    return this._world;
  }

  /**
   * @returns {THREE.Scene}
   */
  get scene () {
    return this._scene;
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

    // this._camera.worldPosition.z = Math.sin(this._theta) * 30;
    // this._camera.worldPosition.x = Math.cos(this._theta) * 30;

    // this._camera.lookAt(this._rollOverMesh.worldPosition);
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
    // this._camera.worldPosition.set(198, 80, 220);
    this._camera.position.set( WORLD_MAP_SIZE / 2 * WORLD_MAP_BLOCK_SIZE, 50 * WORLD_MAP_BLOCK_SIZE, WORLD_MAP_SIZE / 2 * WORLD_MAP_BLOCK_SIZE);
    this._orbitControls = new OrbitControls(this._camera, this._renderer.domElement);

    let targetObject = new THREE.Object3D();
    targetObject.position.set(WORLD_MAP_BLOCK_SIZE * WORLD_MAP_SIZE / 2, WORLD_MAP_BLOCK_SIZE * 10, WORLD_MAP_BLOCK_SIZE * WORLD_MAP_SIZE / 2);
    this._camera.target = targetObject;

    this._orbitControls.target = targetObject.position;
    this._orbitControls.update();

    this._scene.add(this._camera);
  }

  _initFog () {
    this._scene.fog = new THREE.Fog(0xffa1c1, 100 * WORLD_MAP_BLOCK_SIZE, 1000 * WORLD_MAP_BLOCK_SIZE);
  }

  _initGridHelper () {
    this._gridHelper = new THREE.GridHelper(WORLD_MAP_SIZE * WORLD_MAP_BLOCK_SIZE, WORLD_MAP_SIZE / WORLD_MAP_BLOCK_SIZE, 0x666666, 0x999999);
    this._gridHelper.position.set(WORLD_MAP_SIZE / 2 * WORLD_MAP_BLOCK_SIZE, 0, WORLD_MAP_SIZE / 2 * WORLD_MAP_BLOCK_SIZE);
    this._scene.add(
      this._gridHelper
    );
  }

  _addLights () {
    const ambientLight = new THREE.AmbientLight( 0xEEB1C6 );
    this._scene.add( ambientLight );

    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.5 );
    hemiLight.color.setHSL( 0.6, 1, 0.6 );
    hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
    hemiLight.position.set(
      WORLD_MAP_SIZE / 2 * WORLD_MAP_BLOCK_SIZE,
      500 * WORLD_MAP_BLOCK_SIZE,
      WORLD_MAP_SIZE / 2 * WORLD_MAP_BLOCK_SIZE
    );

    const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 5);
    this._scene.add(hemiLight, hemiLightHelper);

    // this._addWorldSpotLight();
    this._addWorldDirectionalLight();
  }

  _addWorldSpotLight () {
    const spotLight = new THREE.SpotLight(0x999999, .6, 0, Math.PI / 2 - .4);
    spotLight.color.setHSL( 0.1, 1, 0.95 );

    const lightHelper = new THREE.CameraHelper( spotLight.shadow.camera );
    this._scene.add( spotLight, lightHelper );

    spotLight.position.set(
      WORLD_MAP_BLOCK_SIZE * WORLD_MAP_SIZE * 1.5,
      WORLD_MAP_BLOCK_SIZE * 200,
      WORLD_MAP_BLOCK_SIZE * WORLD_MAP_SIZE * 1.5
    );

    spotLight.penumbra = 0;
    spotLight.decay = 2;

    this._addShadows(spotLight);

    const targetObject = new THREE.Object3D();
    this._scene.add(targetObject);

    spotLight.target = targetObject;
    targetObject.position.set(
      WORLD_MAP_BLOCK_SIZE * WORLD_MAP_SIZE / 2, 0, WORLD_MAP_BLOCK_SIZE * WORLD_MAP_SIZE / 2
    );
  }

  _addWorldDirectionalLight () {
    const dirLight = new THREE.DirectionalLight( 0x999999, .5 );
    dirLight.color.setHSL( 0.1, 1, 0.95 );

    const dirLightHelper = new THREE.CameraHelper( dirLight.shadow.camera );
    this._scene.add( dirLight, dirLightHelper );

    dirLight.position.set(
      WORLD_MAP_BLOCK_SIZE * WORLD_MAP_SIZE * 1.2,
      WORLD_MAP_BLOCK_SIZE * 300,
      WORLD_MAP_BLOCK_SIZE * WORLD_MAP_SIZE * 1.2
    );

    this._addShadows(dirLight);

    const targetObject = new THREE.Object3D();
    this._scene.add(targetObject);

    dirLight.target = targetObject;
    targetObject.position.set(
      WORLD_MAP_BLOCK_SIZE * WORLD_MAP_SIZE / 2 * 1.2,
      0,
      WORLD_MAP_BLOCK_SIZE * WORLD_MAP_SIZE / 2 * 1.2
    );
  }

  _addShadows (light) {
    light.castShadow = true;

    light.shadow.mapSize.width = 1 << 11;
    light.shadow.mapSize.height = 1 << 11;

    const offset = 200 * WORLD_MAP_BLOCK_SIZE;

    light.shadow.camera.top = offset;
    light.shadow.camera.right = offset;
    light.shadow.camera.bottom = -offset;
    light.shadow.camera.left = -offset;

    light.shadow.camera.far = 3500;
    light.shadow.camera.bias = -0.0001;
    light.shadow.camera.darkness = 0.45;
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
