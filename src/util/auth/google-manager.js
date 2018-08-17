import { ResourceLoader } from "../loaders";

const PLATFORM_SDK = '//apis.google.com/js/platform.js';
const PLATFORM_SDK_PROPERTY = 'gapi';

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
   * @return {Promise<*>}
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
   * @return {*}
   */
  get platform () {
    return window[ PLATFORM_SDK_PROPERTY ];
  }
}
