import { TextSprite } from "./index";

export class TextLabel extends TextSprite {

  /**
   * @type {THREE.Object3D}
   * @private
   */
  _object3D = null;

  /**
   * @type {number}
   * @private
   */
  _verticalOffset = 0;

  /**
   * @type {number}
   * @private
   */
  _maxVerticalOffset = 0;

  /**
   * @type {number}
   * @private
   */
  _minDistance = 50;

  /**
   * @type {number}
   * @private
   */
  _maxDistance = 150;

  /**
   * @type {number}
   * @private
   */
  _minScale = .01;

  /**
   * @type {number}
   * @private
   */
  _maxScale = 8;

  /**
   * @param {string} text
   * @param {*} options
   * @param {THREE.Object3D} object3D
   */
  constructor (text = '', options, object3D) {
    options.textureOptions.text = text;
    super( options );
    this._object3D = object3D;
  }

  /**
   * @param {*} args
   * @returns {*}
   */
  updateMatrix (...args) {
    this.updateScaleModifier();
    this.updateVerticalOffset();
    return super.updateMatrix(...args);
  }

  /**
   * Updates scale for text
   */
  updateScaleModifier () {
    let { distanceToCamera } = this;
    if (!distanceToCamera) {
      return;
    }

    let scaleModifier = 1;
    if (distanceToCamera < this._minDistance) {
      scaleModifier = Math.max( this._minScale, distanceToCamera / this._minDistance );
    } else if (distanceToCamera > this._maxDistance) {
      scaleModifier = Math.min( this._maxScale, distanceToCamera / this._maxDistance );
    }

    this.scaleModifier = scaleModifier;
  }

  /**
   * Updates vertical offset for text
   */
  updateVerticalOffset () {
    let { distanceToCamera } = this;
    if (!distanceToCamera) {
      return;
    }

    let verticalOffsetAdjustment = 0;
    if (distanceToCamera < this._minDistance) {
      const maxVerticalOffset = this._maxVerticalOffset;
      verticalOffsetAdjustment = ( 1 - this.scaleModifier ) * maxVerticalOffset;
    }

    if (verticalOffsetAdjustment) {
      this.setOffsetPosition(
        new THREE.Vector3( this.position.x, this._verticalOffset - verticalOffsetAdjustment, this.position.z )
      );
    }
  }

  /**
   * @param {string} text
   * @returns {TextLabel}
   */
  setText (text) {
    this.map.text = text;
    return this;
  }

  /**
   * @param {THREE.Vector3} positionOffset
   * @returns {TextLabel}
   */
  setOffsetPosition (positionOffset = new THREE.Vector3()) {
    this.position.set(0, 0, 0).add( positionOffset );
    return this;
  }

  /**
   * @param {THREE.Vector3} positionOffset
   * @returns {TextLabel}
   */
  addOffsetPosition (positionOffset = new THREE.Vector3()) {
    this.position.add( positionOffset );
    return this;
  }

  /**
   * @param {number} offset
   * @param {number} maxOffset
   */
  setVerticalOffset (offset, maxOffset) {
    this._verticalOffset = offset;
    this._maxVerticalOffset = maxOffset;
  }

  /**
   * Attaches label to object
   *
   * @returns {TextLabel}
   */
  attachToObject () {
    if (this._object3D) {
      this._object3D.add( this );
    }
    return this;
  }

  /**
   * Detaches label from object
   *
   * @returns {TextLabel}
   */
  detachFromObject () {
    if (this._object3D) {
      this._object3D.remove( this );
    }
    return this;
  }

  /**
   * Detaches & removes sprite
   */
  dispose () {
    this.detachFromObject();
    super.dispose();
  }
}
