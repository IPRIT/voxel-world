import { TextSprite } from "./index";

export class TextLabel extends TextSprite {

  /**
   * @type {THREE.Object3D}
   * @private
   */
  _object3D = null;

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
