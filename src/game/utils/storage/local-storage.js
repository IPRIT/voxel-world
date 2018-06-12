/**
 * @type {{
 *   isSupported: {get(): boolean},
 *   getItem(string, {version?: number|string}=): *,
 *   setItem(string, (*), {expired?: number, version?: number|string}=): boolean,
 *   removeItem(string): boolean,
 *   _serializeItem((*)): (string|*),
 *   _deserializeItem(string): (Object|*)
 * }}
 */
export const storage = {
  isSupported: {
    /**
     * @returns {boolean}
     */
    get () {
      return typeof window.localStorage !== 'undefined';
    }
  },
  /**
   * @param {string} itemKey
   * @param {number|string?} version
   * @returns {*}
   */
  getItem (itemKey, { version = null } = {}) {
    if (!this.isSupported) {
      return null;
    }
    const serializedItem = localStorage.getItem(itemKey);
    if (!serializedItem) {
      return null;
    }
    const deserializedItem = this._deserializeItem(serializedItem);
    if (!deserializedItem) {
      return null;
    }
    if (deserializedItem.expiredAtMs && deserializedItem.expiredAtMs < Date.now()
      || version && deserializedItem.version !== version) {
      this.removeItem(itemKey);
      return null;
    }
    return deserializedItem.item;
  },
  /**
   * @param {string} itemKey
   * @param {object|*} itemValue
   * @param {number?} expired
   * @param {number|string|*?} version
   * @returns {boolean}
   */
  setItem (itemKey, itemValue, { expired = null, version = null } = {}) {
    if (!this.isSupported) {
      return false;
    }
    const year = 365 * 3600 * 24 * 1000;
    const serializedItem = this._serializeItem({
      expiredAtMs: expired || Date.now() + 10 * year,
      item: itemValue,
      version
    });
    localStorage.setItem(
      itemKey,
      serializedItem
    );
  },
  /**
   * @param {string} itemKey
   * @returns {boolean}
   */
  removeItem (itemKey) {
    if (!this.isSupported) {
      return false;
    }
    localStorage.removeItem(itemKey);
    return true;
  },
  /**
   * @param {object|*} item
   * @returns {string|*}
   * @private
   */
  _serializeItem (item) {
    try {
      return JSON.stringify(item);
    } catch (e) {
      console.error('Cannot serialize object', item);
      return null;
    }
  },
  /**
   * @param {string} string
   * @returns {object|*}
   * @private
   */
  _deserializeItem (string) {
    try {
      return JSON.parse(string);
    } catch (e) {
      console.error('Cannot deserialize object', string);
      return string;
    }
  }
};
