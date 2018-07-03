import Promise from 'bluebird';
import { SkinnedModelLoader } from "../../model/loaders";

export class SkinnedObjectLoader extends SkinnedModelLoader {

  /**
   * @type {SkinnedObjectLoader}
   * @private
   */
  static _instance = null;

  /**
   * @returns {SkinnedObjectLoader}
   */
  static getLoader () {
    if (this._instance) {
      return this._instance;
    }
    return (this._instance = new SkinnedObjectLoader( 100 ));
  }

  /**
   * @param {string} modelName
   * @returns {Promise<{cached: boolean, skinnedMesh?: THREE.SkinnedMesh, model?: {geometry: *, material: *}}>}
   */
  async load (modelName) {
    let fileName = `${modelName}.json`;
    let pathToFile = `/resources/models/skinned/${modelName}/default/`;
    let modelUrl = `${pathToFile}${fileName}`;

    return super.load( fileName, modelUrl, 15 );
  }
}
