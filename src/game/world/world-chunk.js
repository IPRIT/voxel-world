import { WorldChunkType } from "./world-chunk-type";

export class WorldChunk {

  mesh;
  triangles = 0;
  dirty = false;

  fromX = 0;
  fromY = 0;
  fromZ = 0;

  toX = 0;
  toY = 0;
  toZ = 0;

  x = 0;
  y = 0;
  z = 0;

  type = WorldChunkType.TYPE_CHUNK_WORLD;

  blocks = [];
  voxBlocksNumber = 0;

  constructor () {
  }

  get blocksNumber () {
    return this.blocks.length;
  }

  get chunkIndex () {
    return `${this.x}|${this.z}`;
  }
}
