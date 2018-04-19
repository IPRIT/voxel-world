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
    this._theta += .005;
    // this._dirLight.rotation.z = Math.cos(this._theta);

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

    // this._addObjects(); // shader

    this._initWorld();

    if (!this._mouse) {
      this._mouse = new THREE.Vector2();
      this._raycaster = new THREE.Raycaster();
    }
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
    this._orbitControls.enableKeys = false;
    this._orbitControls.enablePan = false;
    this._orbitControls.zoomSpeed = 2;
    this._orbitControls.maxPolarAngle = Math.PI / 2;
    this._orbitControls.mouseButtons = { ORBIT: THREE.MOUSE.RIGHT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.LEFT };
    this._orbitControls.update();

    this._scene.add(this._camera);
  }

  _initFog () {
    this._scene.fog = new THREE.Fog(0xffa1c1, 100 * WORLD_MAP_BLOCK_SIZE, 1000 * WORLD_MAP_BLOCK_SIZE);
  }

  _initGridHelper () {
    this._gridHelper = new THREE.GridHelper(WORLD_MAP_SIZE * WORLD_MAP_BLOCK_SIZE, WORLD_MAP_SIZE, 0x666666, 0x999999);
    this._gridHelper.position.set(WORLD_MAP_SIZE / 2 * WORLD_MAP_BLOCK_SIZE, -.01, WORLD_MAP_SIZE / 2 * WORLD_MAP_BLOCK_SIZE);
    this._scene.add(
      this._gridHelper
    );
  }

  _addLights () {
    const ambientLight = new THREE.AmbientLight( 0xEEB1C6 );
    this._scene.add( ambientLight );

    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.3 );
    hemiLight.color.setHSL( 0.6, 1, 0.6 );
    hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
    hemiLight.position.set(
      WORLD_MAP_SIZE / 2 * WORLD_MAP_BLOCK_SIZE,
      500 * WORLD_MAP_BLOCK_SIZE,
      WORLD_MAP_SIZE / 2 * WORLD_MAP_BLOCK_SIZE
    );

    const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 50);
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
      WORLD_MAP_BLOCK_SIZE * WORLD_MAP_SIZE / 2,
      0,
      WORLD_MAP_BLOCK_SIZE * WORLD_MAP_SIZE / 2
    );

    this._dirLight = dirLight;
  }

  _addShadows (light) {
    light.castShadow = true;

    light.shadow.mapSize.width = 1 << 10;
    light.shadow.mapSize.height = 1 << 10;

    const offset = 90 * WORLD_MAP_BLOCK_SIZE;

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
    this._camera.aspect = this._screenWidth / this._screenHeight;
    this._camera.updateProjectionMatrix();

    this._renderer.setSize( this._screenWidth, this._screenHeight );
  }

  /**
   * @param {MouseEvent} event
   * @private
   */
  _onMouseDown (event) {
    this._mousePressedDown = event.which === 1;
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
    this._raycaster.setFromCamera( this._mouse, this._camera );
    // calculate objects intersecting the picking ray
    const intersects = this._raycaster.intersectObjects(
      this.world.map.getMeshes()
    );

    // console.log(intersects, intersects.length);

    for (let i = 0; i < intersects.length; i++) {
      let x = ((intersects[i].point.x / WORLD_MAP_BLOCK_SIZE) | 0) + 1;
      let y = ((intersects[i].point.y / WORLD_MAP_BLOCK_SIZE) | 0) + 1;
      let z = ((intersects[i].point.z / WORLD_MAP_BLOCK_SIZE) | 0) + 1;
      this.world.map.addBlock({ x, y, z }, [ 200, 200, 100 ]);
    }
    this.world.map.update();
  }
}
