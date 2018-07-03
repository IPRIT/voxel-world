import { Animal } from "../animal";
import { AnimalType } from "../animal-type";
import { options as animalOptions } from './deer-options';

export class DeerAnimal extends Animal {

  /**
   * @param {object} options
   * @returns {*}
   */
  init (options = {}) {
    const preparedAnimalOptions = this.prepareAnimalOptions( options, animalOptions );

    Object.assign(options, {
      classType: AnimalType.DEER,
      ...preparedAnimalOptions
    });

    return super.init( options );
  }
}
