import { DownloadOperation } from "./download-operation";
import { EntityCache } from "../../game/utils";

export class DownloadOperationCached extends DownloadOperation {

  /**
   * @type {EntityCache}
   * @private
   */
  _cache = null;

  /**
   * @type {number}
   * @private
   */
  _maxCacheSize = 0;

  /**
   * @param {number} maxCacheSize
   */
  constructor (maxCacheSize = 0) {
    super();
    this._initCache( maxCacheSize );
  }

  /**
   * @param {string} resourceUrl
   * @param {number} attemptsNumber
   * @returns {Promise<*>}
   */
  async load (resourceUrl, attemptsNumber = 15) {
    if (this._cache.hasEntity( resourceUrl )) {
      // console.log('[DownloadOperationCached] Cache hit:', resourceUrl);
      return {
        cached: true,
        item: this._cache.getEntity( resourceUrl )
      };
    }

    return super.load( resourceUrl, attemptsNumber ).then(item => {
      this._cache.addEntity( resourceUrl, item );

      return {
        cached: false,
        item
      };
    });
  }

  /**
   * @param {number} maxCacheSize
   * @private
   */
  _initCache (maxCacheSize) {
    this._maxCacheSize = maxCacheSize;
    this._cache = new EntityCache( maxCacheSize );
  }
}
