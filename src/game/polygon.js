export class Polygon {

  /**
   * @type {Game}
   * @private
   */
  _game = null;

  constructor (game) {
    this._game = game;
  }

  debugVoxModel (voxData) {
    console.log(voxData);
  }
}
