import Promise from "bluebird";
import EventEmitter from 'eventemitter3';
import { WORLD_MAP_BLOCK_SIZE, WORLD_MAP_CHUNK_SIZE } from "../../settings";
import { WorldObjectType, WorldObjectVox } from "../world-object";
import { ModelType } from "../../model";
import { WorldChunkLoader } from "../chunks/world-chunk-loader";

export const WorldMapLoadingOperationEvents = {
  CHUNK_LOADED: 'chunkLoaded',
  ALL_CHUNKS_LOADED: 'allChunksLoaded',
};

export class WorldMapLoadingOperation extends EventEmitter {

  /**
   * @type {Array}
   * @private
   */
  _loadQueue = [];

  /**
   * @type {boolean}
   * @private
   */
  _loadQueueActive = false;

  /**
   * @type {boolean}
   * @private
   */
  _canceled = false;

  /**
   * @param {number} x
   * @param {number} z
   * @returns {*[]}
   * @private
   */
  _dummyModelFunction = (x, z) => ([{ x, y: 0, z }, [200, 200, 200]]);

  /**
   * @param {Array<Array<string>>} groups
   * @private
   */
  load (...groups) {
    if (this._canceled || !groups.length) {
      return;
    }
    this._loadQueue.push( ...groups );

    if (!this._loadQueueActive) {
      this._loadQueueActive = true;
      this._processQueue();
    }
  }

  cancel () {
    this._loadQueueActive = false;
    this._loadQueue = [];
    this._canceled = true;
    this._dispose();
  }

  /**
   * @private
   */
  _dispose () {
    this.removeAllListeners();
  }

  /**
   * @private
   */
  async _processQueue () {
    if (this._canceled) {
      return;
    }

    const group = this._loadQueue.shift();
    if (group) {
      await this._loadGroup( group );
    }

    if (this._loadQueue.length) {
      this._processQueue();
    } else if (!this._canceled) {
      this.emit( WorldMapLoadingOperationEvents.ALL_CHUNKS_LOADED );
      this._loadQueueActive = false;
    }
  }

  /**
   * @param {Array<String>} group
   * @returns {*}
   * @private
   */
  _loadGroup (group) {
    return Promise.resolve( group ).map(chunkIndex => {
      return Promise.all([
        chunkIndex,
        this._loadChunk( chunkIndex )
      ]);
    }, { concurrency: 20 }).mapSeries(async ([ chunkIndex, data ]) => {
      let [x, z] = this._parseChunkIndex( chunkIndex );
      let { cached, item = null } = data || {};

      const worldObject = await this._createWorldChunk( item, { x, y: 0, z } );
      this.emit( WorldMapLoadingOperationEvents.CHUNK_LOADED, worldObject, chunkIndex );

      return worldObject;
    });
  }

  /**
   * @param {string} chunkIndex
   * @returns {Promise<{cached: boolean, item: VoxModel}>}
   */
  async _loadChunk (chunkIndex) {
    let mapLoader = WorldChunkLoader.getLoader();
    return mapLoader.load( chunkIndex )
      .catch(error => this._onChunkLoadError( error, chunkIndex ));
  }

  /**
   * @param {*} error
   * @param {string} chunkIndex
   * @private
   */
  _onChunkLoadError (error, chunkIndex) {
    console.warn('[WorldMapLoader] Using fallback chunk due to error:', error);

    const [ x, z ] = this._parseChunkIndex( chunkIndex );
    return this._createWorldChunk(
      this._dummyModelFunction,
      { x, y: 0, z }
    ).then(worldObject => {
      this.emit( WorldMapLoadingOperationEvents.CHUNK_LOADED, worldObject, chunkIndex );
    });
  }

  /**
   * @param {VoxModel|function|null} model
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {Promise<WorldObjectVox>}
   */
  async _createWorldChunk (model, { x, y, z }) {
    const mapChunkObject = new WorldObjectVox( WorldObjectType.MAP, ModelType.VOX );

    mapChunkObject.setModel( model );
    mapChunkObject.position.set(
      x * WORLD_MAP_CHUNK_SIZE,
      y + WORLD_MAP_BLOCK_SIZE / 2,
      z * WORLD_MAP_CHUNK_SIZE
    );
    mapChunkObject.position.multiplyScalar( WORLD_MAP_BLOCK_SIZE );

    return mapChunkObject.init();
  }

  /**
   * @param {string} chunkIndex
   * @returns {number[]}
   * @private
   */
  _parseChunkIndex (chunkIndex) {
    return chunkIndex.split('|').map( Number );
  }
}
