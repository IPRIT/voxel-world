export class AnimalType {

  static DEBUG = 0x200;
  static DEBUG_NAME = 'DEBUG';

  static UNSUPPORTED = 0x400;
  static UNSUPPORTED_NAME = 'UNSUPPORTED';

  static DEER = 0x1;
  static DEER_NAME = 'DEER';

  static mapping = {
    [AnimalType.DEBUG]: AnimalType.DEBUG_NAME,
    [AnimalType.UNSUPPORTED]: AnimalType.UNSUPPORTED_NAME,
    [AnimalType.DEER]: AnimalType.DEER_NAME,
  };

  /**
   * @param {number} classType
   * @returns {string}
   * @static
   */
  static resolveClassName (classType) {
    let modelsMapping = AnimalType.mapping;
    if (!(classType in modelsMapping)) {
      return modelsMapping[ AnimalType.UNSUPPORTED ];
    }
    return modelsMapping[ classType ];
  }
}
