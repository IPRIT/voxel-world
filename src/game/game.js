import * as THREE from 'three';
import OrbitControls from 'three-orbitcontrols';
import JsPerformanceStats from 'stats.js';

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
   * @type {OrbitControls}
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
  _fov = 20;
  _aspect = this._screenWidth / this._screenHeight;
  _near = 10;
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

    this._rollOverMesh.rotation.z = Math.sin(this._theta) * 10;
    this._rollOverMesh.position.y = Math.cos(this._theta) * 5;

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
    this._camera.position.set( 13, 5, 15 );
    this._orbitControls = new OrbitControls(this._camera, this._renderer.domElement);

    this._scene.add(this._camera);
  }

  _initFog () {
    this._scene.fog = new THREE.Fog( 0xFF99AA, 100, 3000);
  }

  _initGridHelper () {
    this._scene.add(new THREE.GridHelper(50, 100, 0x666666, 0x444444));
  }

  _addLights () {
    const ambientLight = new THREE.AmbientLight( 0xEEB1C6 );
    this._scene.add( ambientLight );

    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.2 );
    hemiLight.color.setHSL( 0.6, 1, 0.6 );
    hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
    hemiLight.position.set( 0, 500, 0 );
    this._scene.add( hemiLight );

    const dirLight = new THREE.DirectionalLight( 0x999999, 0.4 );
    dirLight.color.setHSL( 0.1, 1, 0.95 );
    dirLight.position.set( 23, 23, 10 );
    dirLight.position.multiplyScalar( 10 );
    this._scene.add( dirLight );

    //dirLight.castShadow = false;
    dirLight.castShadow = true;

    dirLight.shadow.mapSize.width = 512;
    dirLight.shadow.mapSize.height = 512; // 2048

    const offset = 150;

    dirLight.shadow.camera.top = offset;
    dirLight.shadow.camera.right = offset;
    dirLight.shadow.camera.bottom = -offset;
    dirLight.shadow.camera.left = -offset;

    dirLight.shadow.camera.far = 3500;
    dirLight.shadow.camera.bias = -0.0001;
    dirLight.shadow.camera.darkness = 0.45;
  }

  _addObjects () {
    const path = "images/";
    const format = '.jpg';
    const urls = [
      path + 'posx' + format, path + 'negx' + format,
      path + 'posy' + format, path + 'negy' + format,
      path + 'posz' + format, path + 'negz' + format
    ];
    const textureCube = new THREE.CubeTextureLoader().load( urls );
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
      ].join( "\n" ),
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
      ].join( "\n" )
    };
    const uniforms = THREE.UniformsUtils.clone( shader.uniforms );
    uniforms[ "tCube" ].value = textureCube;
    console.log(textureCube);

    const rollOverGeo = new THREE.SphereGeometry(2, 100, 100);
    const rollOverMaterial = new THREE.ShaderMaterial( {
      uniforms: uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader
    });
    console.log(rollOverMaterial);
    this._rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
    this._rollOverMesh.position.y = 2;
    this._rollOverMesh.position.x = 0;
    this._rollOverMesh.add(new THREE.AxesHelper(2));
    this._scene.add( this._rollOverMesh );
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
