import parseMagicaVoxel from 'parse-magica-voxel';

export class Vox {

  constructor () {
  }

  loadVoxData (file) {
    return this._loadRequest(file).then(req => {
      console.log(`Loaded vox model: ${req.responseURL}`);
      return this._parseVoxelBuffer( req.response );
    });
  }

  _loadRequest (path) {
    const req = new XMLHttpRequest();
    req.open("GET", path, true);
    req.responseType = 'arraybuffer';

    req.send(null);

    return new Promise((resolve, reject) => {
      req.onload = event => resolve(req, event);
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
