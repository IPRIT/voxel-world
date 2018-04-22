import Promise from 'bluebird';
import { ModelLoader } from "../../model/model-loader";

export class PlayerModelLoader extends ModelLoader {

  /**
   * @type {PlayerModelLoader}
   * @private
   */
  static _instance = null;

  /**
   * @returns {PlayerModelLoader}
   */
  static getLoader () {
    if (this._instance) {
      return this._instance;
    }
    return (this._instance = new PlayerModelLoader( 50 ));
  }

  /**
   * @param {string} modelName
   * @returns {Promise<{cached: boolean, model: VoxModel}>}
   */
  async load (modelName) {
    let fileName = `${modelName}.vox`;
    let pathToFile = `resources/models/classes/`;
    let modelUrl = `${pathToFile}${fileName}`;

    return super.load( fileName, modelUrl, 15 );
  }
}
