import Promise from 'bluebird';
import parseMagicaVoxel from "parse-magica-voxel";

/**
 * @param voxelBuffer
 * @returns {*}
 */
export function parseVoxelBuffer (voxelBuffer) {
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

/**
 * @param {string} url
 */
export function voxLoadAndParse (url) {
  const req = new XMLHttpRequest();
  req.open("GET", url, true);
  req.responseType = 'arraybuffer';

  req.send(null);

  return new Promise((resolve, reject) => {
    req.onreadystatechange = () => {
      if (req.readyState === 4 && (req.status === 200 || req.status === 0)) {
        resolve( parseVoxelBuffer( req.response ) );
      }
    };
    req.onerror = event => reject();
  });
}
