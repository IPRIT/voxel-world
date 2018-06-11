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
  load (url) {
    return VoxLoader.getLoader().load( url ).then(model => {
      this._model = model;
      this._url = url;
      this._loaded = true;
      
      return model;
    });
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
