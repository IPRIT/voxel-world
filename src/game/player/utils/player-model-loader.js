import Promise from 'bluebird';
import { SkinnedModelLoader } from "../../model/loaders";

export class PlayerModelLoader extends SkinnedModelLoader {

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
   * @returns {Promise<{cached: boolean, skinnedMesh?: THREE.SkinnedMesh, model?: {geometry: *, material: *}}>}
   */
  async load (modelName) {
    let fileName = `${modelName}-pink.json`;
    let pathToFile = `resources/models/skinned/`;
    let modelUrl = `${pathToFile}${fileName}`;

    return super.load( fileName, modelUrl, 15 );
  }
}
