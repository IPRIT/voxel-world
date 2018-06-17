export class WorldChunkType {

  static MAP_CHUNK = 0x1;
  static OBJECT_CHUNK = 0x2;

  /**
   * @returns {{MAP_CHUNK: number, OBJECT_CHUNK: number}}
   */
  static getPlainObject () {
    return {
      MAP_CHUNK: 0x1,
      OBJECT_CHUNK: 0x2
    };
  }
}
