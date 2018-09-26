import { Animal } from "../animal";
import { AnimalMap } from "../../../dictionary";
import { options as animalOptions } from './deer-options';

export class DeerAnimal extends Animal {

  /**
   * @param {object} options
   * @returns {*}
   */
  init (options = {}) {
    const preparedAnimalOptions = this.prepareAnimalOptions( options, animalOptions );

    Object.assign(options, {
      characterType: AnimalMap.DEER,
      ...preparedAnimalOptions
    });

    return super.init( options );
  }
}
