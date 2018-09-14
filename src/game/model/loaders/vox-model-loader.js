import { Vox } from "../../vox/index";
import Promise from "bluebird";
import { WORLD_MAP_SIZE } from "../../settings";
import { DownloadOperationCached } from "../../../util/loaders/download-operation-cached";
import { VoxLoader } from "../../vox";

function getY(x, z) {
  x -= WORLD_MAP_SIZE / 2;
  z -= WORLD_MAP_SIZE / 2;
  x /= WORLD_MAP_SIZE / 5;
  z /= WORLD_MAP_SIZE / 5;
  return Math.sin( x ** 2 + 0.1 * z ** 2 )
    / ( 0.1 + Math.sqrt(x ** 2 + 2 * z ** 2) ** 2 )
    + ( x ** 2 + 1.9 * z ** 2 ) * Math.exp( 1 - Math.sqrt( x ** 2 + 2 * z ** 2 ) ** 2 ) / 4.0 * 80 + 3;
}

function model(x, z) {
  let y = getY(x, z) | 0;
  return [{ x, y, z }, [ 200, (y * 10) % 256, 100 ]];
}

window.commonModel = model;

export class VoxModelLoader extends DownloadOperationCached {

  /**
   * @param {string} fileUrl
   * @return {Promise<VoxModel>}
   */
  async download (fileUrl) {
    const voxLoader = VoxLoader.getLoader();
    return voxLoader.load( fileUrl );
  }
}
