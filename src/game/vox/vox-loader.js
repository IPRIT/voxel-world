import { VoxModel } from "./vox-model";
import VoxLoaderWorker from './vox-parser.worker';
import { voxLoadAndParse } from "./vox-parser";
import WorkerPool from "webworker-promise/lib/pool";

const workersNumber = 5;
let workerPool;

if (window.Worker) {
  workerPool = WorkerPool.create({
    create: () => new VoxLoaderWorker(),
    maxThreads: workersNumber,
    maxConcurrentPerWorker: 1
  });
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
  async load (url) {
    let voxelData = await this._loadRequest(url);
    return new VoxModel( voxelData );
  }

  /**
   * @param url
   * @returns {Promise<any>}
   * @private
   */
  async _loadRequest (url) {
    return workerPool && workerPool.postMessage( url )
      || voxLoadAndParse( url );
  }
}
