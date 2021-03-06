import EventEmitter from 'eventemitter3';
import { TransitionEvents } from "./transition-events";
import { TransitionState } from "./transition-state";
import { LivingObject } from "../../living-object";
import { warp } from "../../utils/index";

let TRANSITION_ID = 1;

export class TransitionPlayback extends EventEmitter {

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
  _state = TransitionState.NOT_STARTED;

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
   * @type {THREE.Vector3}
   * @private
   */
  _fromPosition = null;

  /**
   * @type {LivingObject}
   * @private
   */
  _toObject = null;

  /**
   * @type {THREE.Vector3}
   * @private
   */
  _toPosition = null;

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
   * @param {LivingObject|THREE.Vector3} from
   * @param {LivingObject|THREE.Vector3} to
   * @param {*} options
   */
  constructor (from, to, options = {}) {
    super();

    if (from instanceof LivingObject) {
      this._fromObject = from;
    } else {
      this._fromPosition = from;
    }

    if (to instanceof LivingObject) {
      this._toObject = to;
    } else {
      this._toPosition = to;
    }

    this._initOptions( options );
  }

  /**
   * @param {number} deltaTime
   */
  update (deltaTime) {
    if (!this.isRunning) {
      return;
    }
    this._updateVelocity( deltaTime );
    this._updateCurrentPosition( deltaTime );
  }

  /**
   * Play transition
   */
  start () {
    if (this.fromPosition && this.toPosition && !this.isRunning) {

      this._state = TransitionState.RUNNING;

      this._startPosition = this.fromPosition.clone();

      if (this._fromObject) {
        this._startPosition.add({
          x: 0, y: this._fromObject.objectHeight / 2, z: 0
        });
      }

      this._currentPosition = this._startPosition.clone();

      this.emit( TransitionEvents.STARTED );
    }
  }

  /**
   * Pause transition
   */
  pause () {
    this._state = TransitionState.PAUSED;
    this.emit( TransitionEvents.PAUSED );
  }

  /**
   * Finish transition
   */
  finish () {
    this._state = TransitionState.FINISHED;
    this.emit( TransitionEvents.FINISHED );
    this._dispose();
  }

  /**
   * Reset transition
   */
  reset () {
    this._state = TransitionState.NOT_STARTED;
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
    return this._velocity;
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
  get fromPosition () {
    return this._fromObject && this._fromObject.position
      || this._fromPosition;
  }

  /**
   * @returns {THREE.Vector3}
   */
  get toPosition () {
    return this._toObject && this._toObject.position
      || this._toPosition;
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
   * @returns {THREE.Vector3}
   */
  get destinationPosition () {
    const toPosition = this.toPosition;
    const destinationPosition = toPosition && toPosition.clone();

    if (this._toObject && destinationPosition) {
      destinationPosition.add({
        x: 0, y: this._toObject.objectHeight / 2, z: 0
      });
      this._toPosition = destinationPosition;
    }

    return destinationPosition;
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
    if (!this.toPosition) {
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

  /**
   * Destroys the transition
   */
  _dispose () {
    this._fromObject = null;
    this._fromPosition = null;
    this._toObject = null;
    this._toPosition = null;
    this._currentPosition = null;
    this._startPosition = null;
    this._options = null;

    this.removeAllListeners();
  }
}
