import Promise from 'bluebird';
import { VoxModelLoader } from "../../../model/loaders/index";
import { parseChunkIndex } from "../../../utils/index";

export class ChunkLoader extends VoxModelLoader {

  /**
   * @type {ChunkLoader}
   * @private
   */
  static _instance = null;

  /**
   * @returns {ChunkLoader}
   */
  static getLoader () {
    if (this._instance) {
      return this._instance;
    }
    return ( this._instance = new ChunkLoader( 500 ) );
  }

  /**
   * @param {string} chunkIndex
   * @returns {Promise<{cached: boolean, item: VoxModel}>}
   */
  async load (chunkIndex) {
    let [ x, z ] = parseChunkIndex( chunkIndex );
    x %= 8;
    z %= 8;
    let chunkFileName = `chunk-${x}-${z}.vox`;
    let pathToFile = `/resources/models/chunks/`;
    let fileUrl = `${pathToFile}${chunkFileName}`;

    return super.load( fileUrl, 5 );
  }
}
