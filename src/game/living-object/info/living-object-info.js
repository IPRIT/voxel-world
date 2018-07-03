import { LivingObjectType } from "../living-object-type";

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
  _livingObjectType = 0;

  /**
   * @type {string}
   * @private
   */
  _livingObjectTypeName;

  /**
   * @type {number}
   * @private
   */
  _classType = 0;

  /**
   * @type {string}
   * @private
   */
  _className;

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
      livingObjectType = LivingObjectType.OFFENSIVE_ANIMAL,
      livingObjectTypeName,
      classType = 0,
      className = '',
      name = 'Unknown name',
      maxHealth = 1,
      health = 1,
      maxEnergy = 1,
      energy = 1
    } = objectInfo;

    this._id = id;
    this._livingObjectType = livingObjectType;
    this._livingObjectTypeName = livingObjectTypeName;
    this._classType = classType;
    this._className = className;
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
  get livingObjectType () {
    return this._livingObjectType;
  }

  /**
   * @return {string}
   */
  get livingObjectTypeName () {
    return this._livingObjectTypeName;
  }

  /**
   * @return {number}
   */
  get classType () {
    return this._classType;
  }

  /**
   * @return {string}
   */
  get className () {
    return this._className;
  }

  /**
   * @return {boolean}
   */
  get isPlayer () {
    return this._livingObjectType === LivingObjectType.PLAYER;
  }

  /**
   * @return {boolean}
   */
  get isAnimal () {
    return this._livingObjectType === LivingObjectType.ANIMAL;
  }

  /**
   * @return {boolean}
   */
  get isOffensiveAnimal () {
    return this._livingObjectType === LivingObjectType.OFFENSIVE_ANIMAL;
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
