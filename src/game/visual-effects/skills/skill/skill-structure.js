import EventEmitter from 'eventemitter3';

export class SkillStructure extends EventEmitter {

  /**
   * @type {Array<Object>}
   * @private
   */
  _structure = [];

  /**
   * @param {Array<Object>} structure
   */
  setStructure (structure) {
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
   * @returns {Array<*>}
   */
  get structure () {
    return this._structure;
  }
}
