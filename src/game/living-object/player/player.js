import { WORLD_GRAVITY } from "../../settings";
import { LivingObject } from "../index";
import {
  PLAYER_BLOCKS_HEIGHT,
  PLAYER_BLOCKS_RADIUS,
  PLAYER_JUMP_VELOCITY,
  PLAYER_VELOCITY_SCALAR,
  PLAYER_WORLD_SCALE
} from "./player-defaults";
import { LivingObjectType } from "../../dictionary/living-object";

export class Player extends LivingObject {

  /**
   * @type {object}
   * @private
   */
  _options = {};

  /**
   * @type {Object}
   * @private
   */
  _userInfo = null;

  /**
   * @param {object} options
   * @returns {*}
   */
  init (options = {}) {
    this._options = options;

    Object.assign(options, {
      livingObjectType: LivingObjectType.PLAYER,
      worldScale: PLAYER_WORLD_SCALE,
      objectBlocksRadius: PLAYER_BLOCKS_RADIUS,
      objectBlocksHeight: PLAYER_BLOCKS_HEIGHT,
      objectJumpVelocity: PLAYER_JUMP_VELOCITY,
      velocityScalar: PLAYER_VELOCITY_SCALAR,
      gravity: WORLD_GRAVITY
    });

    return super.init( options );
  }

  /**
   * @returns {number}
   */
  get userId () {
    // todo: change later
    return this.id;
  }

  /**
   * @return {boolean}
   */
  get isMe () {
    return false;
  }
}
