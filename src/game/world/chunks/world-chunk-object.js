import { WorldChunkBase } from "./world-chunk-base";
import { WorldChunkType } from "./world-chunk-type";

export class WorldChunkObject extends WorldChunkBase {

  constructor (model) {
    super(model);
    this.setType(WorldChunkType.OBJECT_CHUNK);
  }
}
