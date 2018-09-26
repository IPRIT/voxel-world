import { LivingObjectType } from "../../dictionary/living-object";

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
  _characterType = 0;

  /**
   * @type {string}
   * @private
   */
  _characterTypeName;

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
      livingObjectType = LivingObjectType.OFFENSIVE,
      livingObjectTypeName,
      characterType,
      characterTypeName = '',
      name = 'Unknown name',
      maxHealth = 1,
      health = 1,
      maxEnergy = 1,
      energy = 1
    } = objectInfo;

    this._id = id;
    this._livingObjectType = livingObjectType;
    this._livingObjectTypeName = livingObjectTypeName;
    this._characterType = characterType;
    this._characterTypeName = characterTypeName;
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
  get characterType () {
    return this._characterType;
  }

  /**
   * @return {string}
   */
  get characterTypeName () {
    return this._characterTypeName;
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
  get isOffensive () {
    return this._livingObjectType === LivingObjectType.OFFENSIVE;
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
