import Promise from "bluebird";
import { DownloadOperationCached } from "../../../util/loaders/download-operation-cached";

export class SkinnedModelLoader extends DownloadOperationCached {

  /**
   * @param {string} fileUrl
   * @returns {Promise<*>}
   */
  download (fileUrl) {
    return new Promise((resolve, reject) => {
      let loader = new THREE.ObjectLoader();
      loader.load(fileUrl, scene => {
        const object = scene.children[ 0 ];
        if (!object) {
          reject( new Error('[SkinnedModelLoader]: Skinned object not found') );
        }
        resolve( object );
      });
    });
  }
}
