import Promise from 'bluebird';
import { EntityCache } from "../utils/entity-cache";
import { Vox } from "../vox";

export class ModelLoader {

  /**
   * @type {EntityCache}
   * @private
   */
  _cache = null;

  /**
   * @type {number}
   * @private
   */
  _maxCacheEntities = 0;

  /**
   * @param {number} maxCacheEntities
   */
  constructor (maxCacheEntities = 0) {
    this._maxCacheEntities = maxCacheEntities;
    this._init();
  }

  /**
   * @param {string|number} fileIndex
   * @param {string} fileUrl
   * @param {number} attemptsNumber
   * @returns {Promise<{cached: boolean, model: VoxModel}>}
   */
  async load (fileIndex, fileUrl, attemptsNumber = 15) {
    if (this._cache.hasEntity( fileIndex )) {
      console.log('Cache hit:', fileIndex);
      return {
        cached: true,
        model: this._cache.getEntity( fileIndex )
      };
    }
    return {
      cached: false,
      // model: await Promise.resolve().delay(50 * Math.random() + 50).then(_ => commonModel)
      model: await this._tryLoad(fileUrl, attemptsNumber)
    };
  }

  /**
   * @param {string} objectIndex
   * @param {VoxModel|*} object
   */
  addToCache (objectIndex, object) {
    this._cache.addEntity( objectIndex, object );
  }

  /**
   * @returns {EntityCache}
   */
  get cache () {
    return this._cache;
  }

  /**
   * @returns {number}
   */
  get cacheSize () {
    return this._cache && this._cache.size || 0;
  }

  /**
   * @private
   */
  _init () {
    this._cache = new EntityCache( this._maxCacheEntities );
  }

  /**
   * @param {string} fileUrl
   * @param {number} attemptsNumber
   * @returns {Promise<VoxModel|null>}
   * @private
   */
  async _tryLoad (fileUrl, attemptsNumber = 3) {
    let vox;
    let attempts = 0;

    while (attempts < attemptsNumber) {
      vox = new Vox();
      try {
        console.log(`Try to load model [attempt: ${attempts}]: ${fileUrl}`);
        await vox.load( fileUrl );
        return vox.model;
      } catch (e) {
        console.error('Model loader:', e);
        attempts++;
        await Promise.delay(125 * Math.min(10, attempts) ** 2 + 500);
      }
    }

    return null;
  }
}
