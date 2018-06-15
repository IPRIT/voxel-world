import parseMagicaVoxel from "parse-magica-voxel";

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

/**
 * @param {string} url
 */
export function voxLoadAndParse (url) {
  return fetch( url )
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => {
      return parseMagicaVoxel( arrayBuffer );
    });
}
