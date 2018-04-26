import Promise from 'bluebird';
import { PlayerClassType } from "./player-class-type";
import { PlayerModelLoader } from "./utils/player-model-loader";
import { WorldObjectSkinned } from "../world/world-object/skinned";
import { WorldObjectType } from "../world/world-object";
import { ModelType } from "../model";

export class PlayerObject extends WorldObjectSkinned {

  /**
   * @type {object}
   * @private
   */
  _options = {};

  /**
   * @type {number}
   * @private
   */
  _classType;

  /**
   * Setting up player object
   */
  constructor () {
    super(WorldObjectType.OBJECT, ModelType.SKINNED);
  }

  /**
   * @param {object} options
   * @returns {*}
   */
  init (options = {}) {
    this._options = options;

    let { classType } = options;
    this._classType = classType;

    return this.load().then(([ model ]) => {
      Object.assign(model, {
        _worldScale: .4
      });
      super.init( model );
    });
  }

  /**
   * @returns {*[]}
   */
  async load () {
    let { model } = await this._loadPlayerModel();
    return [ model ];
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
   * @returns {Promise<*>}
   * @private
   */
  _loadPlayerModel () {
    let playerModelLoader = PlayerModelLoader.getLoader();
    return playerModelLoader.load( this.className );
  }
}
