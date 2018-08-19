import { ResourceLoader } from "../loaders";

const PLATFORM_SDK = '//connect.facebook.net/en_US/sdk.js';
const PLATFORM_SDK_PROPERTY = 'FB';

export class FacebookManager {

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
   * @type {FacebookManager}
   * @private
   */
  static _instance = null;

  /**
   * @return {FacebookManager}
   */
  static getManager () {
    if (this._instance) {
      return this._instance;
    }
    return ( this._instance = new FacebookManager() );
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
   * @return {Object}
   */
  get platform () {
    return window[ PLATFORM_SDK_PROPERTY ];
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
