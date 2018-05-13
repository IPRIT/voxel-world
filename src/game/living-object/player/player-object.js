import { PlayerClassType } from "./player-class-type";
import { LivingObject } from "../index";
import {
  PLAYER_BLOCKS_HEIGHT,
  PLAYER_BLOCKS_RADIUS,
  PLAYER_GRAVITY, PLAYER_JUMP_VELOCITY,
  PLAYER_VELOCITY_SCALAR,
  PLAYER_WORLD_SCALE
} from "./player-defaults";

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
      modelName: this.className,
      worldScale: PLAYER_WORLD_SCALE,
      objectBlocksRadius: PLAYER_BLOCKS_RADIUS,
      objectBlocksHeight: PLAYER_BLOCKS_HEIGHT,
      objectJumpVelocity: PLAYER_JUMP_VELOCITY,
      velocityScalar: PLAYER_VELOCITY_SCALAR,
      gravity: PLAYER_GRAVITY,
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
