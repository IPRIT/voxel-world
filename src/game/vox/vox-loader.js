import { VoxModel } from "./vox-model";
import PromiseWorker from 'promise-worker';
import ParseWorker from 'worker-loader!./vox-parser.worker';
import { voxLoadAndParse } from "./vox-parser";

let parseWorker;

if (window.Worker) {
  parseWorker = new PromiseWorker(ParseWorker());
}

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
    return this._loadRequest(url).then(voxelData => {
      return new VoxModel(voxelData);
    });
  }

  /**
   * @param url
   * @returns {Promise<any>}
   * @private
   */
  _loadRequest (url) {
    return parseWorker && parseWorker.postMessage( url )
      || voxLoadAndParse( url );
  }
}
