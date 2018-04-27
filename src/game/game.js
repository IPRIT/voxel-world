import 'bluebird';
import { WORLD_MAP_BLOCK_SIZE, WORLD_MAP_SIZE } from "./settings";
import JsPerformanceStats from 'stats.js';
import { World } from "./world";

function getY(x, z) {
  x -= WORLD_MAP_SIZE / 2;
  z -= WORLD_MAP_SIZE / 2;
  x /= WORLD_MAP_SIZE / 5;
  z /= WORLD_MAP_SIZE / 5;
  return Math.sin(x ** 2 + 0.1 * z ** 2) / (0.1 + Math.sqrt(x ** 2 + 2 * z ** 2) ** 2) + (x ** 2 + 1.9 * z ** 2) * Math.exp(1 - Math.sqrt(x ** 2 + 2 * z ** 2) ** 2) / 4.0 * 80 + 3;
}

function model(x, z) {
  let y = getY(x, z) | 0;
  return [{ x, y, z }, [ 200, (y * 10) % 256, 100 ]];
}

window.commonModel = model;

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

  /**
   * @type {PerspectiveCamera}
   * @private
   */
  _activeCamera = null;

  _screenWidth = window.innerWidth;
  _screenHeight = window.innerHeight;

  /**
   * Camera settings
   */
  _fov = 60;
  _aspect = this._screenWidth / this._screenHeight;
  _near = WORLD_MAP_BLOCK_SIZE;
  _far = 3000 * WORLD_MAP_BLOCK_SIZE;

  _invertedMaxFps = 1 / 60;

  _clock = null;
  _stats = null;

  _animationFrameId = null;
  _pauseOpaqueToken = false;

  init () {
    this._clock = new THREE.Clock();
    this._stats = this._initStats();

    this._initRenderer();
    this._initScene();
    this._initFog();
    this._attachEventListeners();

    this._addWorldLight();

    // this._addObjects(); // shader

    this._initWorld();

    if (!this._mouse) {
      this._mouse = new THREE.Vector2();
      this._raycaster = new THREE.Raycaster();
    }
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
    this._renderer.render(this._scene, this._activeCamera);
  }

  _update () {
    this.world.update( this._clock );
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

    this._activeCamera = this._camera = new THREE.PerspectiveCamera(this._fov, this._aspect, this._near, this._far);
    this._camera.position.set( WORLD_MAP_SIZE / 2 * WORLD_MAP_BLOCK_SIZE, 50 * WORLD_MAP_BLOCK_SIZE, WORLD_MAP_SIZE / 2 * WORLD_MAP_BLOCK_SIZE);

    this._scene.add(this._camera);
  }

  _initFog () {
    // for game
    this._scene.fog = new THREE.Fog(0xffa1c1, 20 * WORLD_MAP_BLOCK_SIZE, 300 * WORLD_MAP_BLOCK_SIZE);

    // for debug
    // this._scene.fog = new THREE.Fog(0xffa1c1, 100 * WORLD_MAP_BLOCK_SIZE, 1000 * WORLD_MAP_BLOCK_SIZE);
  }

  _addWorldLight () {
    const ambientLight = new THREE.AmbientLight( 0xEEB1C6 );
    this._scene.add( ambientLight );

    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.2 );
    hemiLight.color.setHSL( 0.6, 1, 0.6 );
    hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
    hemiLight.position.set(
      WORLD_MAP_SIZE / 2 * WORLD_MAP_BLOCK_SIZE,
      500 * WORLD_MAP_BLOCK_SIZE,
      WORLD_MAP_SIZE / 2 * WORLD_MAP_BLOCK_SIZE
    );

    const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 50);
    this._scene.add(hemiLight, hemiLightHelper);
  }

  _initWorld () {
    this._world = new World(this);
    this._world.init();
  }

  _attachEventListeners () {
    window.addEventListener( 'resize', this._onWindowResize.bind(this), false );
    window.addEventListener( 'mousedown', this._onMouseDown.bind(this), false );
    window.addEventListener( 'mouseup', this._onMouseUp.bind(this), false );
    window.addEventListener( 'mousemove', this._onMouseMove.bind(this), false );
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

  _onWindowResize() {
    this._screenWidth = window.innerWidth;
    this._screenHeight = window.innerHeight;
    this._activeCamera.aspect = this._screenWidth / this._screenHeight;
    this._activeCamera.updateProjectionMatrix();

    this._renderer.setSize( this._screenWidth, this._screenHeight );
  }

  /**
   * @param {MouseEvent} event
   * @private
   */
  _onMouseDown (event) {
    this._mousePressedDown = event.which === 1;

    if (!this._mousePressedDown) {
      return;
    }

    this._mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this._mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    // update the picking ray with the camera and mouse position
    this._raycaster.setFromCamera( this._mouse, this._activeCamera );
    // calculate objects intersecting the picking ray
    const intersects = this._raycaster.intersectObjects(
      [ ...this.world.map.getMeshes(), this.world.map.groundPlate.children[0] ]
    );

    let x = ((intersects[0].point.x / WORLD_MAP_BLOCK_SIZE) | 0) + 1;
    let y = ((intersects[0].point.y / WORLD_MAP_BLOCK_SIZE) | 0) + 1;
    let z = ((intersects[0].point.z / WORLD_MAP_BLOCK_SIZE) | 0) + 1;
    console.log(x, y, z);

    // console.log( this.world.map.getVisibleChunksAt({ x, y, z }) );

    // this.world.map.updateAtPosition({ x, y, z });
  }

  _onMouseUp (event) {
    this._mousePressedDown = false;
  }

  _onMouseMove (event) {
    if (!this._mousePressedDown) {
      return;
    }
    this._mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this._mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    // update the picking ray with the camera and mouse position
    this._raycaster.setFromCamera( this._mouse, this._activeCamera );
    // calculate objects intersecting the picking ray
    const intersects = this._raycaster.intersectObjects(
      [ ...this.world.map.getMeshes(), this.world.map.groundPlate.children[0] ]
    );

    let x = ((intersects[0].point.x / WORLD_MAP_BLOCK_SIZE) | 0) + 1;
    let y = ((intersects[0].point.y / WORLD_MAP_BLOCK_SIZE) | 0) + 1;
    let z = ((intersects[0].point.z / WORLD_MAP_BLOCK_SIZE) | 0) + 1;

    // console.log( this.world.map.getVisibleChunksAt({ x, y, z }) );

    this.world.map.updateAtPosition({ x, y, z });
  }
}
