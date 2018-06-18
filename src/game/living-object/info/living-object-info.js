import { LivingObjectType } from "./living-object-type";

export class LivingObjectInfo {

  /**
   * @type {number}
   * @private
   */
  _id = 0;

  /**
   * @type {number}
   * @private
   */
  _type = 0;

  /**
   * @type {string}
   * @private
   */
  _name = 'Unknown name';

  /**
   * @type {number}
   * @private
   */
  _maxHealth = 1000;

  /**
   * @type {number}
   * @private
   */
  _health = 780;

  /**
   * @type {number}
   * @private
   */
  _maxEnergy = 500;

  /**
   * @type {number}
   * @private
   */
  _energy = 230;

  /**
   * @param {*} objectInfo
   */
  constructor (objectInfo = {}) {
    let {
      id,
      type = LivingObjectType.OFFENSIVE_ANIMAL,
      name = 'Unknown name',
      maxHealth = 1,
      health = 1,
      maxEnergy = 1,
      energy = 1
    } = objectInfo;

    this._id = id;
    this._type = type;
    this._name = name;
    this._maxHealth = maxHealth;
    this._health = health;
    this._maxEnergy = maxEnergy;
    this._energy = energy;
  }

  /**
   * @return {number}
   */
  get id () {
    return this._id;
  }

  /**
   * @return {number}
   */
  get type () {
    return this._type;
  }

  /**
   * @return {string}
   */
  get name () {
    return this._name;
  }

  /**
   * @return {number}
   */
  get maxHealth () {
    return this._maxHealth;
  }

  /**
   * @return {number}
   */
  get maxEnergy () {
    return this._maxEnergy;
  }

  /**
   * @return {number}
   */
  get health () {
    return this._health;
  }

  /**
   * @return {number}
   */
  get energy () {
    return this._energy;
  }
}
