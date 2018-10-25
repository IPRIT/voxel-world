import { WORLD_MAP_BLOCK_SIZE, WORLD_MAP_BLOCK_SIZE_POWER, WORLD_MAP_CHUNK_SIZE_POWER } from "../settings";

export const FRAMES_PER_SECOND = 60;
export const FRAMES_DELTA_SEC = 1 / 60;
export const FRAMES_DELTA_MS = 1000 / 60;

/**
 * @param {number[]} colorArray
 * @returns {number}
 */
export function rgbToInt(colorArray) {
  return ((colorArray[0] & 0xFF) << 24)
    | ((colorArray[1] & 0xFF) << 16)
    | ((colorArray[2] & 0xFF) << 8)
    | (0 & 0xFF);
}

/**
 * @param {THREE.Vector3} vector
 * @param {number} toFixed
 * @returns {THREE.Vector3}
 */
export function floorVector (vector, toFixed = 0) {
  if (!toFixed) {
    vector.x |= 0;
    vector.y |= 0;
    vector.z |= 0;
  } else {
    vector.x = ensureNumber( vector.x.toFixed( toFixed ) );
    vector.y = ensureNumber( vector.y.toFixed( toFixed ) );
    vector.z = ensureNumber( vector.z.toFixed( toFixed ) );
  }

  return vector;
}

/**
 * @param {THREE.Vector3} vector
 * @returns {boolean}
 */
export function isVectorZeroStrict (vector) {
  return vector.equals({ x: 0, y: 0, z: 0 });
}

/**
 * @param {THREE.Vector3} vector
 * @param {number} eps
 * @returns {boolean}
 */
export function isVectorZero (vector, eps = 1e-5) {
  for (let i = 0; i < 3; ++i) {
    if (Math.abs(vector.getComponent( i )) > eps) {
      return false;
    }
  }
  return true;
}

/**
 * @param {number} value
 * @param {number} deltaTime
 * @param {number} framesDeltaSec
 * @returns {number}
 */
export function warp (value, deltaTime, framesDeltaSec = FRAMES_DELTA_SEC) {
  return value * warpRatio( deltaTime, framesDeltaSec );
}

/**
 * @param {number} deltaTime
 * @param {number} framesDeltaSec
 * @returns {number}
 */
export function warpRatio (deltaTime, framesDeltaSec = FRAMES_DELTA_SEC) {
  return deltaTime / framesDeltaSec;
}

/**
 * @param {number} value
 * @param {number} bitPosition
 * @returns {number}
 */
export function hasBit (value, bitPosition) {
  return value & powers.powersOfTwo[ bitPosition ];
}

/**
 * @param {number} value
 * @param {number} bitPosition
 * @returns {number}
 */
export function setBit (value, bitPosition) {
  return value | powers.powersOfTwo[ bitPosition ];
}

/**
 * @param {number} value
 * @param {number} bitPosition
 * @returns {number}
 */
export function unsetBit (value, bitPosition) {
  return value & ~powers.powersOfTwo[ bitPosition ];
}

/**
 * @see http://graphics.stanford.edu/~seander/bithacks.html#RoundUpPowerOf2
 * @param {number} v
 * @returns {number}
 */
export function nearestHighestPowerOfTwo (v) {
  v--;
  v |= v >> 1;
  v |= v >> 2;
  v |= v >> 4;
  v |= v >> 8;
  v |= v >> 16;
  return ++v;
}

/**
 * @see http://graphics.stanford.edu/~seander/bithacks.html#DetermineIfPowerOf2
 * @param {number} v
 * @returns {boolean}
 */
export function isPowerOfTwo (v) {
  return v && !(v & (v - 1));
}

/**
 * Computes integer log2 of number
 * @see http://graphics.stanford.edu/~seander/bithacks.html#IntegerLog
 * @param {number} v
 * @returns {number}
 */
export function log2 (v) {
  let b = [ 0x2, 0xC, 0xF0, 0xFF00, 0xFFFF0000 ];
  let S = [ 1, 2, 4, 8, 16 ];
  let r = 0; // result of log2(v) will go here
  for (let i = 4; i >= 0; i--) { // unroll for speed...
    if (v & b[i]) {
      v >>= S[i];
      r |= S[i];
    }
  }
  return r;
}

/**
 * 0000100011110111000 ->
 * 0000100011110111111 ->
 * 0000100011111111000 ^ 0000100011110111111 ->
 * 0000000000001000000 ->
 * 0000000000000100000
 * @param {number} v
 * @returns {number}
 */
export function lowestMaxBit (v) {
  // filling lowest bit set
  v |= v - 1;
  // find difference between current value and value with lowest zero bit "fired"
  v ^= v | (v + 1);
  return v >> 1;
}

const powersOfTwoInv = {
  1: 0
};
const powersOfTwo = {
  0: 1
};

for (let i = 1; i <= 32; ++i) {
  const powerOfTwo = powersOfTwo[ i - 1 ] * 2;
  powersOfTwo[ i ] = powerOfTwo;
  powersOfTwoInv[ powerOfTwo ] = i;
}

export const powers = { powersOfTwo, powersOfTwoInv };

/**
 * @param objects
 * @returns {*}
 */
export function extendDeep (...objects) {
  if (objects.length === 1) {
    return objects[ 0 ];
  }

  let result = {};
  for (let i = 0; i < objects.length; ++i) {
    mergeDeep( result, objects[ i ] );
  }

  return result;
}

/**
 * Custom deep objects merge for particle options
 *
 * @param {*} objectA
 * @param {*} objectB
 */
export function mergeDeep(objectA, objectB) {
  if (typeof objectB !== 'object' || Array.isArray(objectB)) {
    return objectB;
  }

  Object.keys( objectB ).forEach(keyB => {
    if (typeof objectB[ keyB ] === 'object'
      && objectB[ keyB ] !== null
      && !objectB[ keyB ].clone) {
      objectA[ keyB ] = mergeDeep( objectA[ keyB ] || {}, objectB[ keyB ] );
    } else {
      objectA[ keyB ] = objectB[ keyB ];
    }
  });

  return objectA;
}

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function valueBetween (value, min = -Infinity, max = Infinity) {
  if (min > max) {
    [ min, max ] = [ max, min ];
  }
  return Math.min(
    Math.max( ensureNumber(value), min ),
    max
  );
}

/**
 * @param {number|*} value
 * @returns {number}
 */
export function ensureNumber (value) {
  value = Number( value );
  return Number.isNaN( value ) ? 0 : value;
}

/**
 * @param {number} x
 * @param {number} z
 * @returns {string}
 */
export function buildChunkIndex (x, z) {
  return `${x}|${z}`;
}

/**
 * @param {string} value
 * @returns {number[]}
 */
export function parseChunkIndex (value) {
  return value.split( '|' ).map( ensureNumber );
}

/**
 * @param {string} value
 * @returns {THREE.Vector3}
 */
export function parseChunkIndexToVector (value) {
  const parsedIndex = parseChunkIndex( value );
  return new THREE.Vector3( parsedIndex[ 0 ], 0, parsedIndex[ 1 ] );
}

/**
 * @param {Object} object
 * @returns {Object}
 */
export function revertObject (object) {
  return Object.keys( object ).reduce((result, key) => {
    const value = object[ key ];
    Reflect.set( result, value, key.toLowerCase() );
    return result;
  }, {});
}

/**
 * @param {THREE.Vector3} position
 * @returns {THREE.Vector3}
 */
export function transformToBlockCoords (position) {
  return floorVector( position.clone().divideScalar( WORLD_MAP_BLOCK_SIZE ) );
}

/**
 * @param {number} x
 * @param {number} z
 * @returns {Array<number>}
 */
export function transformToChunkCoords (x, z) {
  return [
    x >> WORLD_MAP_CHUNK_SIZE_POWER,
    z >> WORLD_MAP_CHUNK_SIZE_POWER
  ];
}

/**
 * @param {number} x
 * @param {number} z
 * @returns {Array<number>}
 */
export function transformWorldToChunkCoords (x, z) {
  return transformToChunkCoords(
    x >> WORLD_MAP_BLOCK_SIZE_POWER,
    z >> WORLD_MAP_BLOCK_SIZE_POWER
  );
}
