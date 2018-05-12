import { PlayerClassType } from "./player-class-type";
import { LivingObject } from "../index";
import { PLAYER_VELOCITY_SCALAR } from "./player-defaults";

export class PlayerObject extends LivingObject {

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
   * @param {object} options
   * @returns {*}
   */
  init (options = {}) {
    this._options = options;

    let { classType } = options;
    this._classType = classType;

    Object.assign(options, {
      worldScale: .4,
      objectBlocksHeight: 3,
      objectBlocksRadius: 2, // only even numbers
      modelName: this.className,
      velocityScalar: PLAYER_VELOCITY_SCALAR
    });

    return super.init( options );
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
}
