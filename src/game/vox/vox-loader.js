import parseMagicaVoxel from "parse-magica-voxel";
import { VoxModel } from "./vox-model";

export class VoxLoader {

  /**
   * @type {VoxLoader}
   * @private
   */
  static _instance = null;

  /**
   * @returns {VoxLoader}
   */
  static getLoader() {
    if (this._instance) {
      return this._instance;
    }
    return (this._instance = new VoxLoader());
  }

  /**
   * @param url
   * @returns {Promise<VoxModel>}
   */
  load (url) {
    return this._loadRequest(url).then(req => {
      console.log(`Loaded model: ${req.responseURL}`);
      return this._parseVoxelBuffer( req.response );
    }).then(voxelData => {
      return new VoxModel(voxelData);
    });
  }

  _loadRequest (url) {
    const req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.responseType = 'arraybuffer';

    req.send(null);

    return new Promise((resolve, reject) => {
      req.onreadystatechange = () => {
        if (req.readyState === 4 && (req.status === 200 || req.status === 0)) {
          resolve(req);
        }
      };
      req.onerror = event => reject(req, event);
    });
  }

  /**
   * @param {ArrayBuffer} voxelBuffer
   * @returns {*}
   * @private
   */
  _parseVoxelBuffer (voxelBuffer) {
    /**
     *  MagicaVoxel .vox File Format [10/18/2016]
     *
     *  File Structure : RIFF style
     *  -------------------------------------------------------------------------------
     *  # Bytes  | Type       | Value
     *  -------------------------------------------------------------------------------
     *  1x4      | char       | id 'VOX ' : 'V' 'O' 'X' 'space', 'V' is first
     *  4        | int        | version number : 150
     *
     *  @see https://github.com/ephtracy/voxel-model/blob/master/MagicaVoxel-file-format-vox.txt
     */
    return parseMagicaVoxel(voxelBuffer);
  }
}
