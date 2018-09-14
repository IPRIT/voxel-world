import Promise from 'bluebird';
import { VoxModelLoader } from "../../model/loaders/index";

export class WorldChunkLoader extends VoxModelLoader {

  /**
   * @type {WorldChunkLoader}
   * @private
   */
  static _instance = null;

  /**
   * @returns {WorldChunkLoader}
   */
  static getLoader () {
    if (this._instance) {
      return this._instance;
    }
    return ( this._instance = new WorldChunkLoader( 500 ) );
  }

  /**
   * @param {string} chunkIndex
   * @returns {Promise<{cached: boolean, item: VoxModel}>}
   */
  async load (chunkIndex) {
    let [ x, z ] = chunkIndex.split('|').map(Number);
    x = x % 8; z = z % 8;
    let chunkFileName = `chunk-${x}-${z}.vox`;
    let pathToFile = `/resources/models/chunks/`;
    let fileUrl = `${pathToFile}${chunkFileName}`;

    return super.load( fileUrl, 5 );
  }
}
