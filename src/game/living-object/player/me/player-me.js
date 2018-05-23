import { Player } from "../player";
import { PlayerCamera } from "./player-camera";
import { PlayerWorldLight } from "./player-world-light";
import { PlayerControls } from "./player-controls";
import { TransitionPlayback } from "../../../effects";
import { Game } from "../../../game";
import { ParticlesPool } from "../../../effects/particle/particles-pool";

export class PlayerMe extends Player {

  /**
   * @type {PlayerCamera}
   * @private
   */
  _camera = null;

  /**
   * @type {PlayerWorldLight}
   * @private
   */
  _light = null;

  /**
   * @type {PlayerControls}
   * @private
   */
  _controls = null;

  /**
   * @param options
   * @returns {*}
   */
  async init (options = {}) {
    this._initCamera();
    this._initLights();
    this._initControls();
    this.__particles = [];
    return super.init(options).then(_ => {
      this._camera.targetCenter();
    });
  }

  /**
   * @param {number} deltaTime
   */
  update (deltaTime) {
    super.update( deltaTime );

    if (this._controls) {
      this._controls.update( deltaTime );
    }
    if (this._camera) {
      this._camera.update();
    }
    if (this._light) {
      this._light.update();
    }

    const timeScale = .3;

    let pool = ParticlesPool.getPool();
    let bucket = pool.take( 2 );

    let particles = bucket.particles;
    for (let i = 0; i < particles.length; ++i) {
      const particle = particles[ i ];
      let randX = Math.random() * 2 - 1;
      let randZ = Math.random() * 2 - 1;
      particle.setOptions({
        velocity: new THREE.Vector3(randX, 1, randZ).normalize().multiplyScalar( 120 ).setY(50),
        rotationVelocity: new THREE.Vector3(randX, Math.random() / 10, randZ),
        acceleration: new THREE.Vector3(-randX, 10, -randZ).normalize().multiplyScalar(5),
        position: this.position.clone().sub( new THREE.Vector3(randX, 0, randZ).normalize().multiplyScalar(8) ), // .add({ x: 0, y: this.objectHeight / 2, z: 0 }),
        lifetime: 200,
        scale: Math.random() + .5,
        timeScale
      });
      Game.getInstance().scene.add( particle );
      particle.start();
      this.__particles.push({
        bucket,
        particle
      });
    }

    for (let i = 0; i < this.__particles.length; ++i) {
      this.__particles[i].particle.update( deltaTime );
      if (this.__particles[i].particle.isStopped) {
        Game.getInstance().scene.remove( this.__particles[i].particle );
        if (!this.__particles[i].bucket.isReleased) {
          this.__particles[i].bucket.release();
        }
        this.__particles.splice( i--, 1 );
      }
    }
  }

  /**
   * @param {LivingObject} livingObject
   */
  setTargetObject (livingObject) {
    if (livingObject) {
      if (this.targetObject && livingObject.id !== this.targetObject.id) {
        this.resetTargetObject();
      }
      livingObject.select();
    }
    super.setTargetObject( livingObject );
  }

  resetTargetObject () {
    if (this.targetObject) {
      this.targetObject.deselect();
    }
    super.resetTargetObject();
  }

  jump () {
    if (!this.isJumping) {
      super.jump();
    }
  }

  /**
   * @returns {PlayerCamera}
   */
  get camera () {
    return this._camera;
  }

  /**
   * @returns {PlayerCamera}
   * @private
   */
  _initCamera () {
    this._camera = new PlayerCamera( this );
    this._camera.initOrbitControls();
    this._camera.initStartPosition();
    this._camera.makeActive();

    this.add( this._camera );

    return this._camera;
  }

  /**
   * @returns {PlayerWorldLight}
   * @private
   */
  _initLights () {
    this._light = new PlayerWorldLight( this, 0x999999, .4 );
    this._light.init();
    this._light.attachToWorld();

    return this._light;
  }

  /**
   * @private
   */
  _initControls () {
    this._controls = new PlayerControls( this );
    this._controls.init();
  }
}
