import { AbstractModelLoader } from "./abstract-model-loader";
import { Vox } from "../../vox/index";
import Promise from "bluebird";

export class VoxModelLoader extends AbstractModelLoader {

  /**
   * @param {string|number} fileIndex
   * @param {string} fileUrl
   * @param {number} attemptsNumber
   * @returns {Promise<{cached: boolean, worldObject?: WorldObjectVox, model?: VoxModel}>}
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

  /**
   * @param {string} fileUrl
   * @param {number} attemptsNumber
   * @returns {Promise<*>}
   */
  async tryLoad (fileUrl, attemptsNumber) {
    return this.tryUntil(async attemptNumber => {
      // console.log(`Trying to load vox model [attempt: ${attemptNumber}]: ${fileUrl}`);
      // return commonModel;
      let vox = new Vox();
      return vox.load( fileUrl );
    }, attemptsNumber);
  }
}
