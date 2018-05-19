import { AbstractModelLoader } from "./abstract-model-loader";
import { Vox } from "../../vox/index";
import Promise from "bluebird";
import { WORLD_MAP_SIZE } from "../../settings";

function getY(x, z) {
  x -= WORLD_MAP_SIZE / 2;
  z -= WORLD_MAP_SIZE / 2;
  x /= WORLD_MAP_SIZE / 5;
  z /= WORLD_MAP_SIZE / 5;
  return Math.sin(x ** 2 + 0.1 * z ** 2) / (0.1 + Math.sqrt(x ** 2 + 2 * z ** 2) ** 2) + (x ** 2 + 1.9 * z ** 2) * Math.exp(1 - Math.sqrt(x ** 2 + 2 * z ** 2) ** 2) / 4.0 * 80 + 3;
}

function model(x, z) {
  let y = getY(x, z) | 0;
  return [{ x, y, z }, [ 200, (y * 10) % 256, 100 ]];
}

window.commonModel = model;

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
      return commonModel;
      let vox = new Vox();
      return vox.load( fileUrl );
    }, attemptsNumber);
  }
}
