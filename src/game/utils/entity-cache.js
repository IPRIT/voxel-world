export class EntityCache {

  /**
   * @type {number}
   * @private
   */
  _maxEntitiesNumber = 0;

  /**
   * @type {*}
   * @private
   */
  _cache = {};

  /**
   * @type {string[]}
   * @private
   */
  _cacheHistory = [];

  /**
   * @param {number} maxEntitiesNumber
   */
  constructor (maxEntitiesNumber) {
    this._maxEntitiesNumber = maxEntitiesNumber;
  }

  /**
   * @param {string} key
   * @returns {*|null}
   */
  getEntity (key) {
    return this._cache[ key ] || null;
  }

  /**
   * @param {string} key
   * @param {*} entity
   * @returns {EntityCache}
   */
  addEntity (key, entity) {
    if (!this.hasEntity( key )) {
      this._cache[ key ] = entity;
      this._cacheHistory.push( key );
    }
    this._freeOldEntities();
    return this;
  }

  /**
   * @param {string} key
   * @returns {boolean}
   */
  hasEntity (key) {
    return !!this._cache[ key ];
  }

  /**
   * @param {string} key
   * @returns {EntityCache}
   */
  removeEntity (key) {
    if (this.hasEntity( key )) {
      this._cache[ key ].remove && this._cache[ key ].remove();
      this._cache[ key ] = null;
      delete this._cache[ key ];
    }
    return this;
  }

  /**
   * @returns {number}
   */
  get size () {
    return Object.keys( this._cache || {} ).length;
  }

  /**
   * @private
   */
  _freeOldEntities () {
    while ( this._cacheHistory.length > this._maxEntitiesNumber ) {
      this.removeEntity( this._cacheHistory.shift() );
    }
  }
}
