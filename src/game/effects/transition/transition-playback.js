import { TransitionState } from "./transition-state";
import { warp } from "../../utils/index";

let TRANSITION_ID = 1;

export class TransitionPlayback {

  /**
   * @type {number}
   * @private
   */
  _id = TRANSITION_ID++;

  /**
   * Uses to set time direction and scale
   * Default is 1 - default velocity
   *
   * @type {number}
   * @private
   */
  _timeScale = 1;

  /**
   * @type {number}
   * @private
   */
  _state = TransitionState.PAUSED;

  /**
   * @type {number}
   * @private
   */
  _velocity = 1;

  /**
   * @type {number}
   * @private
   */
  _acceleration = 0;

  /**
   * @type {LivingObject}
   * @private
   */
  _fromObject = null;

  /**
   * @type {LivingObject}
   * @private
   */
  _toObject = null;

  /**
   * @type {THREE.Vector3}
   * @private
   */
  _currentPosition = new THREE.Vector3();

  /**
   * @type {THREE.Vector3}
   * @private
   */
  _startPosition = new THREE.Vector3();

  /**
   * @type {*}
   * @private
   */
  _options = {};

  /**
   * @param {LivingObject} fromObject
   * @param {LivingObject} toObject
   * @param {*} options
   */
  constructor (fromObject, toObject, options = {}) {
    this._fromObject = fromObject;
    this._toObject = toObject;
    this._initOptions( options );
  }

  start () {
    if (this._fromObject && this._toObject && !this.isRunning) {
      this._startPosition = this._fromObject.position.clone().add({
        x: 0, y: this._toObject.objectHeight / 2, z: 0
      });
      this._currentPosition = this._startPosition.clone();
      this._state = TransitionState.RUNNING;
    }
  }

  /**
   * @param {number} deltaTime
   */
  update (deltaTime) {
    if (this.isPaused) {
      return;
    }
    this._updateVelocity( deltaTime );
    this._updateCurrentPosition( deltaTime );
  }

  pause () {
    this._state = TransitionState.PAUSED;
  }

  finish () {
    this._state = TransitionState.FINISHED;
  }

  reset () {
    this.finish();
    this._initOptions( this._options );
    this._currentPosition = new THREE.Vector3();
    this._startPosition = new THREE.Vector3();
  }

  /**
   * @param {number} timeScale
   */
  setTimeScale (timeScale) {
    this._timeScale = timeScale;
  }

  /**
   * @param {number} velocity
   */
  setVelocity (velocity) {
    this._velocity = velocity;
  }

  /**
   * Destroys the transition
   */
  dispose () {
    this.finish();
    this._fromObject = null;
    this._toObject = null;
  }

  /**
   * @returns {number}
   */
  get timeScale () {
    return this._timeScale;
  }

  /**
   * @returns {number}
   */
  get id () {
    return this._id;
  }

  /**
   * @returns {number}
   */
  get velocity () {
    return this._velocity * this._timeScale;
  }

  /**
   * @returns {boolean}
   */
  get isRunning () {
    return this._state === TransitionState.RUNNING;
  }

  /**
   * @returns {boolean}
   */
  get isPaused () {
    return this._state === TransitionState.PAUSED;
  }

  /**
   * @returns {boolean}
   */
  get isFinished () {
    return this._state === TransitionState.FINISHED;
  }

  /**
   * @returns {THREE.Vector3}
   */
  get startPosition () {
    return this._startPosition.clone();
  }

  /**
   * @returns {THREE.Vector3}
   */
  get currentPosition () {
    return this._currentPosition;
  }

  /**
   * @returns {THREE.Vector3|*}
   */
  get destinationPosition () {
    return this._toObject && this._toObject.position.clone().add({
      x: 0, y: this._toObject.objectHeight / 2, z: 0
    });
  }

  /**
   * @returns {number}
   */
  get distanceToDestination () {
    return this._currentPosition.distanceTo( this.destinationPosition );
  }

  /**
   * @param {*} options
   * @private
   */
  _initOptions (options) {
    this._options = options;

    let {
      timeScale = 1,
      velocity = 1,
      acceleration = 0
    } = options;
    this._timeScale = timeScale;
    this._velocity = velocity;
    this._acceleration = acceleration;
  }

  /**
   * @param {number} deltaTime
   * @private
   */
  _updateCurrentPosition (deltaTime) {
    if (!this._toObject) {
      return this.dispose();
    }
    let direction = this.destinationPosition
      .sub( this._currentPosition )
      .normalize();
    let deltaPosition = direction.multiplyScalar(
      this._computeDeltaDistance( deltaTime )
    );
    this._currentPosition.add( deltaPosition );

    if (this.distanceToDestination < .1) {
      this.finish();
    }
  }

  /**
   * @param {number} deltaTime
   * @returns {number}
   * @private
   */
  _updateVelocity (deltaTime) {
    if (this._acceleration) {
      this._velocity += warp( this._acceleration, deltaTime );
    }
  }

  /**
   * @param {number} deltaTime
   * @returns {number}
   * @private
   */
  _computeDeltaDistance (deltaTime) {
    const deltaDistance = this._timeScale * (
      this._velocity * deltaTime
      + this._acceleration * deltaTime * deltaTime * .5
    );
    return Math.min( deltaDistance, this.distanceToDestination );
  }
}
