/* Chunks */
export const WORLD_MAP_CHUNK_SIZE_POWER = 6;
export const WORLD_MAP_CHUNK_HEIGHT_POWER = 5; // can't be greater than 5 due to UInt32Array limitations

export const WORLD_MAP_CHUNK_SIZE = 1 << WORLD_MAP_CHUNK_SIZE_POWER;
export const WORLD_MAP_CHUNK_HEIGHT = 1 << WORLD_MAP_CHUNK_HEIGHT_POWER;

export const WORLD_MAP_CHUNK_VIEW_DISTANCE = 9;

export const WORLD_MAP_CHUNK_SIZE_VECTOR = [
  WORLD_MAP_CHUNK_SIZE,
  WORLD_MAP_CHUNK_HEIGHT,
  WORLD_MAP_CHUNK_SIZE
];

/* Map */
export const WORLD_MAP_SIZE = 1 << 14;
export const WORLD_MAP_BLOCK_SIZE = 2;

export const WORLD_GRAVITY = 1;
