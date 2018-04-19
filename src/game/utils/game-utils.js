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
