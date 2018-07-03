import { LivingObject } from "../living-object";
import { WORLD_GRAVITY } from "../../settings";
import { LivingObjectType } from "../living-object-type";

export class Animal extends LivingObject {

  /**
   * @type {object}
   * @private
   */
  _options = {};

  /**
   * @param {object} options
   * @returns {*}
   */
  init (options = {}) {
    this._options = options;

    Object.assign(options, {
      livingObjectType: LivingObjectType.ANIMAL,
      gravity: WORLD_GRAVITY
    });

    return super.init( options );
  }

  /**
   * @param {*} options
   * @param {*} animalOptions
   * @return {*}
   */
  prepareAnimalOptions (options = {}, animalOptions = {}) {
    let clonedAnimalOptions = { ...animalOptions };

    let { objectInfo = {} } = options;
    let defaultObjectInfo = clonedAnimalOptions.objectInfo || {};

    objectInfo = Object.assign( {}, defaultObjectInfo, objectInfo );

    clonedAnimalOptions.objectInfo = objectInfo;

    return clonedAnimalOptions;
  }
}
