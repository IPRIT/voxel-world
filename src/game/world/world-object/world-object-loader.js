import Promise from 'bluebird';
import { ModelLoader } from "../../model/model-loader";

export class WorldObjectLoader extends ModelLoader {

  /**
   * @param {string|number} fileIndex
   * @param {string} fileUrl
   * @param {number} attemptsNumber
   * @returns {Promise<{cached: boolean, worldObject?: WorldObject, model?: VoxModel}>}
   */
  async load (fileIndex, fileUrl, attemptsNumber = 15) {
    let object = await super.load( fileIndex, fileUrl, attemptsNumber );
    if (object.cached) {
      return {
        cached: true,
        worldObject: object.model
      }
    }
    return object;
  }
}
