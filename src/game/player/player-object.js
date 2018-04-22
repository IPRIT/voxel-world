import Promise from 'bluebird';
import { WorldObject } from "../world/world-object";
import { PlayerClassType } from "./player-class-types";
import { PlayerModelLoader } from "./utils/player-model-loader";

export class PlayerObject extends WorldObject {

  _options = {};

  _classType;

  constructor () {
    super();
  }

  init (options = {}) {
    this._options = options;

    let { classType } = options;
    this._classType = classType;

    return this.load().then(_ => {
      super.init();
    });
  }

  /**
   * @returns {Promise<void>}
   */
  async load () {
    let model = await this._loadPlayerModel();
    this.setModel( model );
  }

  /**
   * @returns {number}
   */
  get classType () {
    return this._classType;
  }

  /**
   * @returns {string}
   */
  get className () {
    return PlayerClassType.resolveClassName( this.classType ).toLowerCase();
  }

  /**
   * @returns {Promise<VoxModel>}
   * @private
   */
  _loadPlayerModel () {
    let playerModelLoader = PlayerModelLoader.getLoader();
    return playerModelLoader.load( this.className ).then(_ => {
      return _.model;
    });
  }
}
