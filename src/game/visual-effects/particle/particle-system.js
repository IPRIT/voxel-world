import EventEmitter from 'eventemitter3';
import { ParticleSystemState } from "./particle-system-state";
import { ParticlesPool } from "./particles-pool";
import { Game } from "../../game";
import { isVectorZeroStrict, warp } from "../../utils";
import { ParticlesBucketEvents } from "./particles-bucket-events";
import { ParticleSystemEvents } from "./particle-system-events";

const zeroVector = new THREE.Vector3();

export class ParticleSystem extends THREE.Object3D {

  /**
   * @type {EventEmitter}
   * @private
   */
  _eventEmitter = null;

  /**
   * @type {*}
   * @private
   */
  _options = {};

  /**
   * @type {boolean}
   * @private
   */
  _cacheGeneratedOptions = true;

  /**
   * @type {Array<*>}
   * @private
   */
  _optionsCache = [];

  /**
   * @type {number}
   * @private
   */
  _optionsCacheCursor = 0;

  /**
   * @type {THREE.Object3D|LivingObject|*}
   * @private
   */
  _parentContainer = null;

  /**
   * @type {boolean}
   * @private
   */
  _attachParticlesToLocal = false;

  /**
   * @type {number}
   * @private
   */
  _spawnRate = 1000;

  /**
   * @type {number}
   * @private
   */
  _timeScale = 1;

  /**
   * @type {number}
   * @private
   */
  _timeElapsed = 0;

  /**
   * @type {number}
   * @private
   */
  _particlesSpawned = 0;

  /**
   * @type {THREE.Vector3}
   * @private
   */
  _axis = null;

  /**
   * @type {THREE.Vector3}
   * @private
   */
  _rotationVelocity = null;

  /**
   * @type {*}
   * @private
   */
  _particleOptions = {};

  /**
   * @type {number}
   * @private
   */
  _maxParticlesNumber = 10;

  /**
   * @type {Function}
   * @private
   */
  _particleGenerateContext = null;

  /**
   * @type {Array<THREE.Vector3|number>}
   * @private
   */
  _particleColorRange = null;

  /**
   * @type {boolean}
   * @private
   */
  _particleIsHSLRange = false;

  /**
   * @type {number|Function}
   * @private
   */
  _particleLifetime = 1000;

  /**
   * @type {THREE.Vector3|Function}
   * @private
   */
  _particleVelocity = null;

  /**
   * @type {THREE.Vector3|Function}
   * @private
   */
  _particleRotationVelocity = null;

  /**
   * @type {THREE.Vector3|Function}
   * @private
   */
  _particlePositionOffset = null;

  /**
   * @type {THREE.Vector3|Function}
   * @private
   */
  _particleAcceleration = null;

  /**
   * @type {number|Function}
   * @private
   */
  _particleScale = 1;

  /**
   * @type {number}
   * @private
   */
  _particleOpacity = 1;

  /**
   * @type {number|Function}
   * @private
   */
  _particleOpacityVelocity = 0;

  /**
   * @type {number}
   * @private
   */
  _state = ParticleSystemState.NOT_STARTED;

  /**
   * @type {ParticlesBucket}
   * @private
   */
  _bucket = null;

  /**
   * @type {Array<Particle>}
   * @private
   */
  _usingParticles = [];

  /**
   * @type {Array<Particle>}
   * @private
   */
  _freeParticles = [];

  /**
   * @param {*} options
   */
  constructor (options = {}) {
    super();
    this._eventEmitter = new EventEmitter();
    this._initOptions( options );
  }

  /**
   * Starts the system
   */
  start () {
    this._state = ParticleSystemState.RUNNING;

    this._bucket = this.pool.take( this._maxParticlesNumber );
    this._bucket.on( ParticlesBucketEvents.TIME_LIMIT_EXCEEDED, this._onBucketTimeLimitExceeded.bind( this ) );

    this._particleIsHSLRange
      ? this._bucket.setHSLRange( ...this._particleColorRange )
      : this._bucket.setHexRange( ...this._particleColorRange );

    this._freeParticles = [].concat( this._bucket.particles );
    this._usingParticles = [];
    this._timeElapsed = 0;
  }

  /**
   * @param {number} deltaTime
   */
  update (deltaTime) {
    if (this.isFinished) {
      return;
    }

    deltaTime *= this._timeScale;
    this._timeElapsed += deltaTime * 1000;

    if (this.isRunning) {
      this._spawnParticles();
    }

    this._updateSystem( deltaTime );

    if (this.isFinishing && (!this._usingParticles || !this._usingParticles.length)) {
      if (!this.isFinished) {
        this._finish();
      }
    }
  }

  /**
   * Start finishing process
   */
  stop () {
    this._startFinishing();
  }

  /**
   * @param {string} eventName
   * @param {Function} fn
   */
  on (eventName, fn) {
    this._eventEmitter.on( eventName, fn );
  }

  /**
   * @param {string} eventName
   * @param {Function} fn
   */
  once (eventName, fn) {
    this._eventEmitter.once( eventName, fn );
  }

  /**
   * @param {string} eventName
   * @param {*} args
   */
  emit (eventName, ...args) {
    this._eventEmitter.emit( eventName, ...args );
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners () {
    this._eventEmitter.removeAllListeners();
  }

  /**
   * @returns {ParticlesPool}
   */
  get pool () {
    return ParticlesPool.getPool();
  }

  /**
   * @returns {THREE.Scene}
   */
  get scene () {
    return Game.getInstance().scene;
  }

  /**
   * @returns {THREE.Scene|LivingObject|THREE.Object3D}
   */
  get parentContainer () {
    return this._attachParticlesToLocal
      ? this : (this._parentContainer || this.scene);
  }

  /**
   * @returns {THREE.Vector3}
   */
  get originPosition () {
    return this._attachParticlesToLocal
      ? zeroVector : this.position;
  }

  /**
   * @returns {boolean}
   */
  get isRunning () {
    return this._state === ParticleSystemState.RUNNING;
  }

  /**
   * @returns {boolean}
   */
  get isFinishing () {
    return this._state === ParticleSystemState.FINISHING;
  }

  /**
   * @returns {boolean}
   */
  get isFinished () {
    return this._state === ParticleSystemState.FINISHED;
  }

  /**
   * @param {*} options
   * @private
   */
  _initOptions (options = {}) {
    let {
      particleOptions = {},
      timeScale = 1,
      maxParticlesNumber = 10,
      spawnRate = 1000,
      axis = new THREE.Vector3(0, 1, 0),
      rotationVelocity = new THREE.Vector3(),
      container = null,
      attachParticlesToLocal = false
    } = options;

    this._particleOptions = particleOptions;
    this._options = options;

    this._parentContainer = container;
    this._attachParticlesToLocal = attachParticlesToLocal;
    this._timeScale = timeScale;
    this._axis = axis;
    this._rotationVelocity = this._extractValue( rotationVelocity );
    this._spawnRate = spawnRate;

    this._maxParticlesNumber = maxParticlesNumber;

    {
      let {
        generateContext = () => {},
        colorRange = [ 0x000000, 0xffffff ],
        isHSLRange = false,
        lifetime = () => {
          return Math.random() * 1000;
        },
        velocity = new THREE.Vector3(1, 1, 1),
        rotationVelocity = new THREE.Vector3(1, 1, 1),
        positionOffset = new THREE.Vector3(1, 1, 1),
        acceleration = new THREE.Vector3(1, 1, 1),
        scale = 1,
        opacity = 1,
        opacityVelocity = 0
      } = particleOptions;

      this._particleColorRange = colorRange;
      this._particleIsHSLRange = isHSLRange;
      this._particleLifetime = lifetime;
      this._particleVelocity = velocity;
      this._particleRotationVelocity = rotationVelocity;
      this._particlePositionOffset = positionOffset;
      this._particleAcceleration = acceleration;
      this._particleScale = scale;
      this._particleOpacity = opacity;
      this._particleOpacityVelocity = opacityVelocity;
      this._particleGenerateContext = generateContext;
    }
  }

  /**
   * @param {number} deltaTime
   * @private
   */
  _updateSystem (deltaTime) {
    this._updateParticles( deltaTime );
    this._updateRotation( deltaTime );
  }

  /**
   * @param {number} deltaTime
   * @private
   */
  _updateParticles (deltaTime) {
    for (let i = 0; i < this._usingParticles.length; ++i) {
      const particle = this._usingParticles[ i ];
      particle.update( deltaTime );

      if (particle.isStopped) {
        this._swapParticle( particle, i-- );
      }
    }
  }

  /**
   * @param {number} deltaTime
   * @private
   */
  _updateRotation (deltaTime) {
    if (isVectorZeroStrict( this._rotationVelocity )) {
      return;
    }
    const timeWarp = warp( 1, deltaTime );
    this.rotation.x += this._rotationVelocity.x * timeWarp;
    this.rotation.y += this._rotationVelocity.y * timeWarp;
    this.rotation.z += this._rotationVelocity.z * timeWarp;
  }

  /**
   * @param {Particle} targetParticle
   * @param {number} index
   * @param {boolean} release
   * @private
   */
  _swapParticle (targetParticle, index, release = true) {
    if (release) {
      this._usingParticles.splice( index, 1 );
      this._freeParticles.push( targetParticle );
    } else {
      this._freeParticles.splice( index, 1 );
      this._usingParticles.push( targetParticle );
    }
  }

  /**
   * @private
   */
  _spawnParticles () {
    const desiredParticlesSpawned = Math.floor( this._spawnRate * this._timeElapsed );
    const needToBeSpawned = desiredParticlesSpawned - this._particlesSpawned;
    if (needToBeSpawned <= 0) {
      return;
    }
    for (let i = 0; i < needToBeSpawned; ++i) {
      this._spawnParticle();
    }
  }

  /**
   * @private
   */
  _spawnParticle () {
    if (!this._freeParticles.length) {
      return;
    }
    const particle = this._freeParticles.shift();

    if (!this._attachParticlesToLocal) {
      particle.position.copy( this.position );
    }

    let particleOptions = this._createParticleOptions();
    particle.setOptions( particleOptions );
    particle.start();

    this.parentContainer.add( particle );

    this._particlesSpawned++;

    this._usingParticles.push( particle );
  }

  /**
   * @returns {*}
   * @private
   */
  _createParticleOptions () {
    let particleOptions;

    if (this._cacheGeneratedOptions) {
      if (this._optionsCache.length < this._maxParticlesNumber) {
        particleOptions = this._generateParticleOptions();
        this._optionsCache.push( particleOptions );
      } else {
        particleOptions = this._updateOptionsPosition(
          this._optionsCache[ this._optionsCacheCursor++ % this._optionsCache.length ]
        );
      }
    } else {
      particleOptions = this._generateParticleOptions();
    }

    return particleOptions;
  }

  /**
   * @returns {{
   *   velocity: THREE.Vector3,
   *   rotationVelocity: THREE.Vector3,
   *   acceleration: THREE.Vector3,
   *   position: THREE.Vector3,
   *   scale: number,
   *   lifetime: number,
   *   timeScale: number
   * }}
   * @private
   */
  _generateParticleOptions () {
    const context = this._particleGenerateContext();
    const origin = this.originPosition.clone();
    const position = origin.add(
      this._extractValue( this._particlePositionOffset, context )
    );

    return {
      context,
      position,
      velocity: this._extractValue( this._particleVelocity, context ),
      rotationVelocity: this._extractValue( this._particleRotationVelocity, context ),
      acceleration: this._extractValue( this._particleAcceleration, context ),
      scale: this._extractValue( this._particleScale, context ),
      opacity: this._extractValue( this._particleOpacity, context ),
      opacityVelocity: this._extractValue( this._particleOpacityVelocity, context ),
      lifetime: this._extractValue( this._particleLifetime, context ),
      timeScale: this._timeScale
    };
  }

  /**
   * @param {*} options
   * @returns {*}
   * @private
   */
  _updateOptionsPosition (options) {
    const origin = this.originPosition.clone();
    options.position = origin.add(
      this._extractValue( this._particlePositionOffset, options.context )
    );
    return options;
  }

  /**
   * @param {Function|*} fnOrValue
   * @param {*} fnContext
   * @returns {*}
   * @private
   */
  _extractValue (fnOrValue, fnContext = {}) {
    if (typeof fnOrValue === 'function') {
      return fnOrValue( fnContext );
    }
    return fnOrValue;
  }

  /**
   * @private
   */
  _startFinishing () {
    this._state = ParticleSystemState.FINISHING;
    this.emit( ParticleSystemEvents.FINISHING );
  }

  /**
   * @private
   */
  _finish () {
    this._state = ParticleSystemState.FINISHED;
    this.emit( ParticleSystemEvents.FINISHED );
    this._release();
    this._dispose();
  }

  /**
   * Release the system
   */
  _release () {
    if (this._bucket) {
      this._bucket.release();
    }
  }

  /**
   * @param {Array<Particle>} particles
   * @private
   */
  _onBucketTimeLimitExceeded (particles) {
    this._finish();
  }

  /**
   * Disposes the system
   */
  _dispose () {
    // removing yourself
    if (this.parent) {
      this.parent.remove( this );
    }

    this._options = null;
    this._optionsCache = null;
    this._particleOptions = null;
    this._bucket = null;
    this._axis = null;
    this._usingParticles = null;
    this._freeParticles = null;

    this._particleGenerateContext = null;
    this._particleColorRange = null;
    this._particleLifetime = null;
    this._particleVelocity = null;
    this._particleRotationVelocity = null;
    this._particlePositionOffset = null;
    this._particleAcceleration = null;
    this._particleScale = null;
    this._particleOpacityVelocity = null;

    this.removeAllListeners();
    this._eventEmitter = null;
  }
}
