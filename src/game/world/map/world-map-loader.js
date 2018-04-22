import Promise from 'bluebird';
import { WorldObjectLoader } from "../world-object";

export class WorldMapLoader extends WorldObjectLoader {

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
   * @returns {Promise<{cached: boolean, worldObject?: WorldObject, model?: VoxModel}>}
   */
  async load (chunkIndex) {
    let [ x, z ] = chunkIndex.split('|').map(Number);
    x = 0; z = 0;
    let chunkFileName = `world-chunk-${x}-${z}.vox`;
    let pathToFile = `resources/models/chunks/`;
    let modelUrl = `${pathToFile}${chunkFileName}`;

    return super.load( chunkIndex, modelUrl, 15 );
  }
}
