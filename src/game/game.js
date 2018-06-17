import 'bluebird';
import RendererStats from '@xailabs/three-renderer-stats';
import { WORLD_MAP_BLOCK_SIZE, WORLD_MAP_SIZE } from "./settings";
import JsPerformanceStats from 'stats.js';
import { World } from "./world";
import { UpdateWarper } from "./utils/update-warper";
import { RuntimeShaders } from "./utils/shaders/RuntimeShaders";

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
   * @type {RuntimeShaders}
   * @private
   */
  _runtimeShaders = null;

  /**
   * Initializing application
   */
  init () {
    this._clock = new THREE.Clock( true );
    this._stats = this._initStats();

    this._runtimeShaders = RuntimeShaders.getManager();

    this._initRenderer();
    this._attachToDom();
    this._initScene();
    this._initFog();
    this._attachEventListeners();
    this._addWorldLight();
    this._initWorld();

    this._updateWarper = new UpdateWarper( 60, 1 );
    this._updateWarper.onUpdate(deltaTime => {
      this.world.update( deltaTime );
    });

    let gui = new dat.GUI();
    gui.add(this._updateWarper, 'timeScale', -.5, 5);

    document.querySelector('.dg.ac').addEventListener('mousedown', ev => {
      ev.stopPropagation();
    });
  }

  /**
   * Update cycle
   */
  update () {
    const deltaTime = this._clock.getDelta();
    this._updateWarper.update( deltaTime );
    this._runtimeShaders.update( deltaTime );

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
    this._runtimeShaders.registerCamera( camera );
    this._activeCamera = camera;
  }

  /**
   * @return {RuntimeShaders}
   */
  get runtimeShaders () {
    return this._runtimeShaders;
  }

  /**
   * @private
   */
  _animate () {
    if (this._pauseToken) {
      return;
    }
    this._animationFrameId = requestAnimationFrame( this._animate.bind(this) );
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
    // this._renderer.setClearColor( 0x0b091c, 1 );
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
      WORLD_MAP_SIZE / 2 * WORLD_MAP_BLOCK_SIZE, 50 * WORLD_MAP_BLOCK_SIZE, WORLD_MAP_SIZE / 2 * WORLD_MAP_BLOCK_SIZE
    );

    this._scene.add( this._worldCamera );
  }

  /**
   * @private
   */
  _initFog () {
    this._scene.fog = new THREE.Fog(0xffa1c1, 50 * WORLD_MAP_BLOCK_SIZE, 600 * WORLD_MAP_BLOCK_SIZE);
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
  _onWindowResize(ev) {
    this._screenWidth = window.innerWidth;
    this._screenHeight = window.innerHeight;
    this._activeCamera.aspect = this._screenWidth / this._screenHeight;
    this._activeCamera.updateProjectionMatrix();

    this._renderer.setSize( this._screenWidth, this._screenHeight );
  }

  /**
   * @private
   */
  _addObjects () {
    const path = "resources/textures/";
    const format = '.jpg';
    const urls = [
      path + 'posx' + format, path + 'negx' + format,
      path + 'posy' + format, path + 'negy' + format,
      path + 'posz' + format, path + 'negz' + format
    ];
    const textureCube = new THREE.CubeTextureLoader().load(urls);
    textureCube.format = THREE.RGBFormat;
    this._scene.background = textureCube;
    this._scene.matrixAutoUpdate = false;

    const shader = {
      uniforms: {
        "mRefractionRatio": { value: 1.02 },
        "mFresnelBias": { value: 0.1 },
        "mFresnelPower": { value: 2.0 },
        "mFresnelScale": { value: 1.0 },
        "tCube": { value: null }
      },
      vertexShader: [
        "uniform float mRefractionRatio;",
        "uniform float mFresnelBias;",
        "uniform float mFresnelScale;",
        "uniform float mFresnelPower;",

        "varying vec3 vReflect;",
        "varying vec3 vRefract[3];",
        "varying float vReflectionFactor;",

        "void main() {",

        "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
        "vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",

        "vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );",

        "vec3 I = worldPosition.xyz - cameraPosition;",

        "vReflect = reflect( I, worldNormal );",
        "vRefract[0] = refract( normalize( I ), worldNormal, mRefractionRatio );",
        "vRefract[1] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.99 );",
        "vRefract[2] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.98 );",
        "vReflectionFactor = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), mFresnelPower );",

        "gl_Position = projectionMatrix * mvPosition;",

        "}"
      ].join("\n"),
      fragmentShader: [
        "uniform samplerCube tCube;",

        "varying vec3 vReflect;",
        "varying vec3 vRefract[3];",
        "varying float vReflectionFactor;",

        "void main() {",

        "vec4 reflectedColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );",
        "vec4 refractedColor = vec4( 1.0 );",

        "refractedColor.r = textureCube( tCube, vec3( -vRefract[0].x, vRefract[0].yz ) ).r;",
        "refractedColor.g = textureCube( tCube, vec3( -vRefract[1].x, vRefract[1].yz ) ).g;",
        "refractedColor.b = textureCube( tCube, vec3( -vRefract[2].x, vRefract[2].yz ) ).b;",

        "gl_FragColor = mix( refractedColor, reflectedColor, clamp( vReflectionFactor, 0.0, 1.0 ) );",

        "}"
      ].join("\n")
    };
    const uniforms = THREE.UniformsUtils.clone(shader.uniforms);
    uniforms["tCube"].value = textureCube;

    const rollOverGeo = new THREE.SphereGeometry(2, 100, 100);
    const rollOverMaterial = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader
    });

    window.shaderMaterial = rollOverMaterial;
  }
}
