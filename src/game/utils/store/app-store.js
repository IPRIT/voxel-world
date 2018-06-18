export class AppStore {

  /**
   * @type {{dispatch: *, commit: *, state: *}}
   * @private
   */
  _store = null;

  /**
   * @type {AppStore}
   * @private
   */
  static _instance = null;

  /**
   * @return {AppStore}
   */
  static getStore () {
    if (this._instance) {
      return this._instance;
    }
    return ( this._instance = new AppStore() );
  }

  /**
   * @param {*} store
   */
  initStore (store) {
    if (this._store) {
      console.warn( 'Duplicate store initializing' );
    }
    this._store = store;
  }

  /**
   * @param {string} event
   * @param {*} data
   * @return {*}
   */
  dispatch (event, ...data) {
    return this._store.dispatch( event, ...data );
  }

  /**
   * @param {string} namespace
   * @return {{dispatch: (function(*, ...[*]): *)}}
   */
  makeDispatchNamespace (namespace) {
    return {
      dispatch: (event, ...data) => {
        let globalEvent = `${namespace}/${event}`;
        return this.dispatch( globalEvent, ...data );
      }
    };
  }

  /**
   * @return {{dispatch: *, commit: *, state: *}}
   */
  get store () {
    return this._store;
  }

  /**
   * @return {*}
   */
  get state () {
    return this._store.state;
  }
}
