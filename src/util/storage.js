/**
 * @type {{
 *   getItem(string, {version?: number|string}=): *,
 *   setItem(string, (*), {expired?: number, version?: number|string}=): boolean,
 *   removeItem(string): boolean
 * }}
 */
export const storage = {
  /**
   * @param {string} itemKey
   * @param {number|string?} version
   * @returns {*}
   */
  getItem (itemKey, { version = null } = {}) {
    const serializedItem = universalStorage.getItem( itemKey );

    if (!serializedItem) {
      return null;
    }

    const deserializedItem = this._deserializeItem( serializedItem );
    if (!deserializedItem) {
      return null;
    }

    if (deserializedItem.expiredAtMs && deserializedItem.expiredAtMs < Date.now()
      || version && deserializedItem.version !== version) {
      this.removeItem( itemKey );
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
    const year = 365 * 3600 * 24 * 1000;
    const serializedItem = this._serializeItem({
      expiredAtMs: expired || Date.now() + 5 * year,
      item: itemValue,
      version
    });

    universalStorage.setItem(
      itemKey,
      serializedItem
    );
  },

  /**
   * @param {string} itemKey
   * @returns {boolean}
   */
  removeItem (itemKey) {
    universalStorage.removeItem( itemKey );
    return true;
  },

  /**
   * @param {object|*} item
   * @returns {string|*}
   * @private
   */
  _serializeItem (item) {
    try {
      return JSON.stringify( item );
    } catch (e) {
      console.error('Cannot serialize an object', item);
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
      return JSON.parse( string );
    } catch (e) {
      console.error('Cannot deserialize an object', string);
      return string;
    }
  }
};

const serverStorage = new Map();

/**
 * @type {{isBrowser: {get(): *}, getItem(*=): *, setItem(*=, *=): void, hasItem(*=): *, removeItem(*=): void}}
 */
const universalStorage = {
  isBrowser: {
    get () {
      return typeof window !== 'undefined';
    }
  },
  getItem (itemKey) {
    if (this.isBrowser) {
      return localStorage.getItem( itemKey );
    }
    return serverStorage.get( itemKey );
  },

  setItem (itemKey, itemValue) {
    if (this.isBrowser) {
      localStorage.setItem( itemKey, itemValue );
    } else {
      serverStorage.set( itemKey, itemValue );
    }
  },

  hasItem (itemKey) {
    return !! this.getItem( itemKey );
  },

  removeItem (itemKey) {
    console.log( itemKey );
    if (this.isBrowser) {
      localStorage.removeItem( itemKey );
    } else {
      serverStorage.delete( itemKey );
    }
  }
};
