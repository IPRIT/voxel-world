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
 * @returns {THREE.Vector3}
 */
export function resetDecimal (vector) {
  vector.x |= 0;
  vector.y |= 0;
  vector.z |= 0;
  return vector;
}

/**
 * @param {number} value
 * @param {number} deltaTime
 * @returns {number}
 * @private
 */
export function warp (value, deltaTime) {
  return value * warpRatio( deltaTime );
}

/**
 * @param {number} deltaTime
 * @returns {number}
 * @private
 */
export function warpRatio (deltaTime) {
  return deltaTime / FRAMES_DELTA_SEC;
}

/**
 * @param {number} value
 * @param {number} bitIndex
 * @returns {number}
 */
export function hasBit (value, bitIndex) {
  return value & ( 1 << bitIndex );
}

/**
 * @param {number} value
 * @param {number} bitIndex
 * @returns {number}
 */
export function setBit (value, bitIndex) {
  return value | ( 1 << bitIndex );
}


/**
 * @param {number} value
 * @param {number} bitIndex
 * @returns {number}
 */
export function unsetBit (value, bitIndex) {
  return value & ~( 1 << bitIndex );
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

const powersOfTwoInv = {};
const powersOfTwo = {};

for (let i = 0; i < 32; ++i) {
  powersOfTwo[ i ] = 2 ** i;
  powersOfTwoInv[ 2 ** i ] = i;
}

export const powers = { powersOfTwo, powersOfTwoInv };
