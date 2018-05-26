import { ParticleSystemState } from "./particle-system-state";
import { ParticlesPool } from "./particles-pool";
import { Game } from "../../game";

export class ParticleSystem extends THREE.Object3D {

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
  _opttionsCacheCursor = 0;

  /**
   * @type {THREE.Object3D|*}
   * @private
   */
  _container = null;

  /**
   * @type {boolean}
   * @private
   */
  _local = false;

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
  _state = ParticleSystemState.NOT_RUNNING;

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
    this._initOptions( options );
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
    if (!this.isStopped) {
      this._spawnParticles();
    }
    this._updateParticles( deltaTime );
  }

  /**
   * @param {THREE.Vector3} axis
   */
  updateAxis (axis) {
    this._axis = axis;
  }

  /**
   * Starts the system
   */
  start () {
    this._bucket = this.pool.take( this._maxParticlesNumber );
    this._particleIsHSLRange
      ? this._bucket.setHSLRange( ...this._particleColorRange )
      : this._bucket.setHexRange( ...this._particleColorRange );
    this._bucket.beforeRelease( this._beforeBucketRelease.bind(this) );

    this._freeParticles = [].concat( this._bucket.particles );
    this._usingParticles = [];
    this._timeElapsed = 0;
    this._state = ParticleSystemState.RUNNING;
  }

  stop () {
    this._state = ParticleSystemState.NOT_RUNNING;
  }

  /**
   * Release the particles
   */
  release () {
    this._bucket && this._bucket.release();
  }

  /**
   * Disposes the system
   */
  dispose () {
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
  }

  /**
   * @returns {ParticlesPool}
   */
  get pool () {
    return ParticlesPool.getPool();
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
  get isStopped () {
    return this._state === ParticleSystemState.NOT_RUNNING;
  }

  /**
   * @returns {boolean}
   */
  get isFinished () {
    return !(this._usingParticles && this._usingParticles.length) && this.isStopped;
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
      container = Game.getInstance().scene,
      local = false
    } = options;

    if (local) {
      container = this;
    }

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
      scale = 1
    } = particleOptions;

    this._particleOptions = particleOptions;
    this._options = options;

    this._container = container;
    this._local = local;
    this._timeScale = timeScale;
    this._axis = axis;
    this._spawnRate = spawnRate;

    this._maxParticlesNumber = maxParticlesNumber;

    this._particleColorRange = colorRange;
    this._particleIsHSLRange = isHSLRange;
    this._particleLifetime = lifetime;
    this._particleVelocity = velocity;
    this._particleRotationVelocity = rotationVelocity;
    this._particlePositionOffset = positionOffset;
    this._particleAcceleration = acceleration;
    this._particleScale = scale;
    this._particleGenerateContext = generateContext;
  }

  /**
   * @param {Array<Particle>} particles
   * @private
   */
  _beforeBucketRelease (particles) {
    if (this.isRunning) {
      this._state = ParticleSystemState.NOT_RUNNING;
    }
    for (let i = 0; i < this._usingParticles.length; ++i) {
      this._usingParticles[ i ].release();
    }
    this.dispose();
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
        this._releaseParticle( particle, i-- );
      }
    }
  }

  /**
   * @param {Particle} particle
   * @param {number} index
   * @private
   */
  _releaseParticle (particle, index) {
    this._usingParticles.splice( index, 1 );
    this._freeParticles.push( particle );
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
    let particleOptions;
    if (this._cacheGeneratedOptions) {
      if (this._optionsCache.length < this._maxParticlesNumber) {
        particleOptions = this._generateParticleOptions();
        this._optionsCache.push( particleOptions );
      } else {
        particleOptions = this._updateOptionsPosition(
          this._optionsCache[ this._opttionsCacheCursor++ % this._optionsCache.length ]
        );
      }
    } else {
      particleOptions = this._generateParticleOptions();
    }

    const particle = this._freeParticles.shift();

    particle.setOptions( particleOptions );
    particle.start();

    this._container.add( particle );
    this._particlesSpawned++;

    this._usingParticles.push( particle );
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
    const origin = this._local
      ? new THREE.Vector3() : this.position.clone();
    const position = origin.add(
      this._getOrInvoke( this._particlePositionOffset, context )
    );

    return {
      context,
      position,
      velocity: this._getOrInvoke( this._particleVelocity, context ),
      rotationVelocity: this._getOrInvoke( this._particleRotationVelocity, context ),
      acceleration: this._getOrInvoke( this._particleAcceleration, context ),
      scale: this._getOrInvoke( this._particleScale, context ),
      lifetime: this._getOrInvoke( this._particleLifetime, context ),
      timeScale: this._timeScale
    };
  }

  /**
   * @param {*} options
   * @returns {*}
   * @private
   */
  _updateOptionsPosition (options) {
    const origin = this._local
      ? new THREE.Vector3() : this.position.clone();
    options.position = origin.add(
      this._getOrInvoke( this._particlePositionOffset, options.context )
    );
    return options;
  }

  /**
   * @param {Function|*} fnOrValue
   * @param {*} fnContext
   * @returns {*}
   * @private
   */
  _getOrInvoke (fnOrValue, fnContext = {}) {
    if (typeof fnOrValue === 'function') {
      return fnOrValue( fnContext );
    }
    return fnOrValue;
  }
}
