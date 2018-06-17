import ShaderFrogRuntime from 'runtime-shaderfrog';
import Promise from 'bluebird';

export class RuntimeShaders {

  /**
   * @type {RuntimeShaders}
   * @private
   */
  static _instance = null;

  /**
   * @type {ShaderFrogRuntime}
   * @private
   */
  _runtimeShaders = null;

  /**
   * @return {RuntimeShaders}
   */
  static getManager () {
    if (this._instance) {
      return this._instance;
    }
    return ( this._instance = new RuntimeShaders() );
  }

  constructor () {
    this._runtimeShaders = new ShaderFrogRuntime();
  }

  /**
   * @param {number} deltaTime
   */
  update (deltaTime) {
    this._runtimeShaders.updateShaders( deltaTime );
  }

  /**
   * @param {PerspectiveCamera} camera
   */
  registerCamera (camera) {
    this._runtimeShaders.registerCamera( camera );
  }

  /**
   * @param {string} url
   * @returns {*}
   */
  load (url) {
    return new Promise((resolve, reject) => {
      this._runtimeShaders.load( url, resolve );
    });
  }

  /**
   * @param {string} url
   * @returns {THREE.Material}
   */
  loadMaterial (url) {
    return this.load( url ).then(shaderData => {
      return this._runtimeShaders.get( shaderData.name );
    });
  }
}
