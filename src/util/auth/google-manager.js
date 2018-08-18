import { ResourceLoader } from "../loaders";

const PLATFORM_SDK = '//apis.google.com/js/platform.js';
const PLATFORM_SDK_PROPERTY = 'gapi';
const PLATFORM_AUTH2_PROPERTY = 'auth2';

export class GoogleManager {

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
    const resourceLoader = new ResourceLoader();
    return resourceLoader.load( PLATFORM_SDK ).then(_ => {
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
}
