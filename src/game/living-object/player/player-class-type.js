export class PlayerClassType {

  static DEBUG = 0x200;
  static DEBUG_NAME = 'DEBUG';

  static UNSUPPORTED = 0x400;
  static UNSUPPORTED_NAME = 'UNSUPPORTED';

  static MYSTIC = 0x1;
  static MYSTIC_NAME = 'MYSTIC';

  static DEER = 0x2;
  static DEER_NAME = 'DEER';

  static mapping = {
    [PlayerClassType.DEBUG]: PlayerClassType.DEBUG_NAME,
    [PlayerClassType.UNSUPPORTED]: PlayerClassType.UNSUPPORTED_NAME,
    [PlayerClassType.MYSTIC]: PlayerClassType.MYSTIC_NAME,
    [PlayerClassType.DEER]: PlayerClassType.DEER_NAME,
  };

  /**
   * @param {number} classType
   * @returns {string}
   * @static
   */
  static resolveClassName (classType) {
    let modelsMapping = PlayerClassType.mapping;
    if (!(classType in modelsMapping)) {
      return modelsMapping[ PlayerClassType.UNSUPPORTED ];
    }
    return modelsMapping[ classType ];
  }
}
