import { warp } from "../utils";

export class ObjectGravity {

  /**
   * @type {boolean}
   * @private
   */
  _velocityUpdate = true;

  /**
   * @type {number}
   * @private
   */
  _velocity = 0;

  /**
   * @type {number}
   * @private
   */
  _gravityAcceleration = 0.8;

  /**
   * @param {number} deltaTime
   */
  update ( deltaTime ) {
    let distance = this._computeDistanceDelta( deltaTime );
    if (this._velocityUpdate) {
      this._updateVelocity( deltaTime );
    }
    return distance;
  }

  /**
   * @param {number} velocity
   */
  setVelocity (velocity) {
    this._velocity = velocity;
  }

  /**
   * @param {number} acceleration
   */
  setAcceleration (acceleration) {
    this._gravityAcceleration = acceleration;
  }

  /**
   * Resets current velocity
   */
  resetVelocity () {
    this._velocity = 0;
  }

  /**
   * Stops updating velocity
   */
  stopUpdatingVelocity () {
    this._velocityUpdate = false;
  }

  /**
   * Resumes updating velocity
   */
  resumeUpdatingVelocity () {
    this._velocityUpdate = true;
  }

  /**
   * @returns {number}
   */
  get velocity () {
    return this._velocity;
  }

  /**
   * @returns {number}
   */
  get acceleration () {
    return this._gravityAcceleration;
  }

  /**
   * @returns {boolean}
   */
  get isUpdating () {
    return this._velocityUpdate;
  }

  /**
   * @param {number} deltaTime
   * @returns {number}
   * @private
   */
  _computeDistanceDelta (deltaTime) {
    return this._velocity * deltaTime
      + .5 * this._gravityAcceleration * deltaTime * deltaTime;
  }

  /**
   * @param {number} deltaTime
   * @returns {number}
   * @private
   */
  _updateVelocity (deltaTime) {
    this._velocity += warp(this._gravityAcceleration, deltaTime);
  }
}
