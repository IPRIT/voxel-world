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

    game.world.map.add( line );
  }
  geometry.verticesNeedUpdate = true;
}
