import { VoxLoader } from "./vox-loader";

export class Vox {

  /**
   * @type {VoxModel}
   * @private
   */
  _model = null;

  /**
   * @type {string}
   * @private
   */
  _url = '';

  /**
   * @type {boolean}
   * @private
   */
  _loaded = false;

  /**
   * @class VoxType
   * @type {number}
   * @private
   */
  _type;

  /**
   * @param url
   * @param {number} type
   * @returns {Promise<Vox>}
   */
  async load (url, type) {
    try {
      this._model = await VoxLoader.getLoader().load(url);
      this._url = url;
      this._loaded = true;
      this._type = type;
    } catch (e) {
      console.log(`Can\'t load model: ${url}`, e);
    }

    return this;
  }

  /**
   * @returns {boolean}
   */
  get loaded () {
    return this._loaded;
  }

  /**
   * @returns {VoxModel}
   */
  get model () {
    return this._model;
  }

  /**
   * @returns {number}
   */
  get type () {
    return this._type;
  }
}
