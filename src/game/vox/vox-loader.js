import Promise from 'bluebird';
import WebworkerPromise from "webworker-promise";
import VoxLoaderWorker from './vox-parser.worker';
import { VoxModel } from "./vox-model";
import { voxLoadAndParse } from "./vox-parser";

const isWorkersSupported = !!window.Worker;
const workersNumber = 5;

let workerPool = [];
let workerIndex = 0;

if (isWorkersSupported) {
  /*workerPool = WorkerPool.create({
    create: () => new VoxLoaderWorker(),
    maxThreads: workersNumber,
    maxConcurrentPerWorker: 2
  });*/

  workerPool = Array( workersNumber ).fill( 0 ).map(_ => {
    return new WebworkerPromise( new VoxLoaderWorker() );
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
   * @param {string} url
   * @returns {Promise<VoxModel>}
   */
  async load (url) {
    return this._loadRequest( url ).then(voxelData => {
      return new VoxModel( voxelData );
    });
  }

  /**
   * @param {string} url
   * @returns {Promise<any>}
   * @private
   */
  async _loadRequest (url) {
    if (isWorkersSupported && workerPool.length) {
      const worker = workerPool[ workerIndex++ % workerPool.length ];
      return worker.postMessage( url );
    }
    return voxLoadAndParse( url );
  }
}
