import Promise from "bluebird";
import { AbstractModelLoader } from "./abstract-model-loader";

export class SkinnedModelLoader extends AbstractModelLoader {

  /**
   * @param {string|number} fileIndex
   * @param {string} fileUrl
   * @param {number} attemptsNumber
   * @returns {Promise<{cached: boolean, skinnedMesh?: THREE.SkinnedMesh, model?: {geometry: *, material: *}}>}
   */
  async load (fileIndex, fileUrl, attemptsNumber = 15) {
    let object = await super.load( fileIndex, fileUrl, attemptsNumber );
    if (object && !object.cached) {
      this.addToCache(fileIndex, object.model);
    }
    return object;
  }

  /**
   * @param {string} fileUrl
   * @param {number} attemptsNumber
   * @returns {Promise<{geometry: *, material: *}>}
   */
  tryLoad (fileUrl, attemptsNumber) {
    return this.tryUntil(attemptNumber => {
      return new Promise((resolve, reject) => {
        // console.log(`Trying to load skinned model [attempt: ${attemptNumber}]: ${fileUrl}`);

        let loader = new THREE.ObjectLoader();
        loader.load(fileUrl, scene => {
          let object = scene.children[0];
          if (!object) {
            reject( new Error('[tryLoad]: Skinned object not found') );
          }
          resolve( object );
        });
      });
    }, attemptsNumber);
  }
}
