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
   * @param url
   * @returns {Promise<VoxModel>}
   */
  async load (url) {
    this._model = await VoxLoader.getLoader().load( url );
    this._url = url;
    this._loaded = true;

    return this._model;
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
}
