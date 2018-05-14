import { WORLD_MAP_SIZE } from "../settings";
import { Game } from "../game";

let lineMaterial = null;
let linesCache = new Map();

export function debugPoints(geometryCacheKey, vertices) {
  if (!lineMaterial) {
    lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 10 });
  }
  let geometry;
  if (linesCache.has( geometryCacheKey )) {
    geometry = linesCache.get( geometryCacheKey ).geometry;
    vertices.forEach((vertex, index) => {
      geometry.vertices[ index ] = vertex;
    });
  } else {
    geometry = new THREE.Geometry();
    geometry.dynamic = true;
    vertices.forEach(vertex => {
      geometry.vertices.push( vertex );
    });
    let line = new THREE.Line(geometry, lineMaterial);
    linesCache.set( geometryCacheKey, line );

    Game.getInstance().world.map.add( line );
  }
  geometry.verticesNeedUpdate = true;
}

/**
 * @param {number} x
 * @param {number} z
 * @returns {number}
 */
function getY(x, z) {
  x -= WORLD_MAP_SIZE / 2;
  z -= WORLD_MAP_SIZE / 2;
  x /= WORLD_MAP_SIZE / 5;
  z /= WORLD_MAP_SIZE / 5;
  return Math.sin(x ** 2 + 0.1 * z ** 2) / (0.1 + Math.sqrt(x ** 2 + 2 * z ** 2) ** 2)
    + (x ** 2 + 1.9 * z ** 2) * Math.exp(1 - Math.sqrt(x ** 2 + 2 * z ** 2) ** 2) / 4.0 * 80
    + 3;
}

/**
 * @param {number} x
 * @param {number} z
 * @returns {*[]}
 */
export function functionModel (x, z) {
  let y = getY(x, z) | 0;
  return [{ x, y, z }, [ 200, (y * 10) % 256, 100 ]];
}
