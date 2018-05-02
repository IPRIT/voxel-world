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
