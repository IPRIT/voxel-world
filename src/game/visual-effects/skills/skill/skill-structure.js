import EventEmitter from 'eventemitter3';

export class SkillStructure extends EventEmitter {

  /**
   * @type {Array<Object>}
   * @private
   */
  _structure = [];

  /**
   * @param structure
   */
  constructor (structure) {
    super();
    this._structure = structure;
  }

  /**
   * Removes all event listeners and setting null to structure object
   */
  dispose () {
    this.removeAllListeners();
    this._structure = null;
  }

  /**
   * @returns {Array<Object>}
   */
  get structure () {
    return this._structure;
  }
}
