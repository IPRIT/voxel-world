import Promise from 'bluebird';
import { VoxModelLoader } from "../../model/loaders";

export class WorldMapLoader extends VoxModelLoader {

  /**
   * @type {WorldMapLoader}
   * @private
   */
  static _instance = null;

  /**
   * @returns {WorldMapLoader}
   */
  static getLoader () {
    if (this._instance) {
      return this._instance;
    }
    return (this._instance = new WorldMapLoader( 500 ));
  }

  /**
   * @param {string} chunkIndex
   * @returns {Promise<{cached: boolean, worldObject?: WorldObjectVox, model?: VoxModel}>}
   */
  async load (chunkIndex) {
    let [ x, z ] = chunkIndex.split('|').map(Number);
    x = x % 2; z = z % 2;
    let chunkFileName = `world-chunk-${x}-${z}.vox`;
    let pathToFile = `resources/models/chunks/`;
    let modelUrl = `${pathToFile}${chunkFileName}`;

    return super.load( chunkIndex, modelUrl, 15 );
  }
}
