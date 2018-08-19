import { ResourceLoader } from "../loaders";

const PLATFORM_SDK = '//apis.google.com/js/platform.js';
const PLATFORM_SDK_PROPERTY = 'gapi';
const PLATFORM_AUTH2_PROPERTY = 'auth2';

export class GoogleManager {

  /**
   * @type {boolean}
   * @private
   */
  _isPlatformLoading = false;

  /**
   * @type {Array<*>}
   * @private
   */
  _platformLoadingQueue = [];

  /**
   * @type {GoogleManager}
   * @private
   */
  static _instance = null;

  /**
   * @return {GoogleManager}
   */
  static getManager () {
    if (this._instance) {
      return this._instance;
    }
    return ( this._instance = new GoogleManager() );
  }

  /**
   * @return {Promise<Object>}
   */
  async loadPlatform () {
    if (this.platform) {
      return this.platform;
    }

    if (this._isPlatformLoading) {
      return this._enqueue();
    }

    this._isPlatformLoading = true;
    const resourceLoader = new ResourceLoader();
    return resourceLoader.load( PLATFORM_SDK ).then(_ => {
      this._resolveQueue( this.platform );
      this._isPlatformLoading = false;
      return this.platform;
    });
  }

  /**
   * @return {Promise<Object>}
   */
  async loadAuth2 () {
    const platform = await this.loadPlatform();
    return new Promise((resolve, reject) => {
      platform.load( 'auth2', _ => resolve( this.auth2 ), reject );
    });
  }

  /**
   * @return {Object}
   */
  get platform () {
    return window[ PLATFORM_SDK_PROPERTY ];
  }

  /**
   * @return {Object}
   */
  get auth2 () {
    return this.platform[ PLATFORM_AUTH2_PROPERTY ];
  }

  /**
   * @return {Promise<*>}
   * @private
   */
  _enqueue () {
    return new Promise((resolve, reject) => {
      this._platformLoadingQueue.push([ resolve, reject ]);
    });
  }

  /**
   * @param {*} resolvedValue
   * @private
   */
  _resolveQueue (resolvedValue) {
    for (let i = 0; i < this._platformLoadingQueue.length; ++i) {
      let [ resolve = () => {} ] = this._platformLoadingQueue[ i ];
      resolve( resolvedValue );
    }
    this._platformLoadingQueue = [];
  }
}
