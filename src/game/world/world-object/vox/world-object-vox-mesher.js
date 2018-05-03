import PromiseWorker from 'promise-worker';
import { WorldChunkType } from '../../chunks/world-chunk-type';
import MesherWorker from './compute-vertices.worker';
import { computeVertices } from "./compute-vertices";

let mesherWorkers = [];
let roundRobinIndex = 0;
const workersNumber = 5;

if (window.Worker) {
  for (let i = 0; i < workersNumber; ++i) {
    mesherWorkers.push( new PromiseWorker(MesherWorker()) );
  }
}

export class WorldObjectVoxMesher {

  /**
   * @type {WorldObjectVox}
   * @private
   */
  _worldObject = null;

  /**
   * @param {WorldObjectVox} worldObject
   */
  constructor (worldObject) {
    this._worldObject = worldObject;
  }

  /**
   * @returns {THREE.Mesh}
   */
  async createOrUpdateMesh (bs) {
    const worldObject = this._worldObject;

    this.resetFaces();
    const { vertices, colors } = await this.computeVertices(bs);
    const geometry = this.createOrUpdateGeometry(vertices, colors);

    let mesh = worldObject.mesh;
    if (!mesh) {
      mesh = new THREE.Mesh(geometry, worldObject.material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    } else {
      mesh.geometry = geometry;
    }

    return (this._worldObject.mesh = mesh);
  }

  /**
   * @param {number[][]} vertices
   * @param {number[][]} colors
   * @returns {THREE.BufferGeometry}
   */
  createOrUpdateGeometry (vertices, colors) {
    const worldObject = this._worldObject;
    const chunk = this._worldObject.chunk;

    chunk.triangles = vertices.length / 3;

    if (!worldObject.mesh) {
      let startingBlocks = 0;

      for (let i = 0; i < chunk.blocks.length; i++) {
        if (chunk.blocks[ i ] !== 0) {
          startingBlocks++;
          chunk.blocks[ i ] &= 0xFFFFFFE0; // why 0xFFFFFFE0? why not 0xFFFFFFC0?
        }
      }

      chunk.startingBlocks = startingBlocks;
      chunk.currentBlocks = startingBlocks;
    }

    let verticesAttribute, colorsAttribute, geometry;

    if (worldObject.mesh && chunk.previousVerticesLength === vertices.length) {
      verticesAttribute = worldObject.vertices;
      colorsAttribute = worldObject.colors;
      geometry = worldObject.geometry;

      for (let i = 0; i < vertices.length; i++) {
        verticesAttribute.setXYZ(i, vertices[i][0], vertices[i][1], vertices[i][2]);
        colorsAttribute.setXYZW(i, colors[i][0], colors[i][1], colors[i][2], 1);
      }
      geometry.setDrawRange(0, vertices.length);
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
      geometry.computeVertexNormals();
    } else {
      verticesAttribute = new THREE.BufferAttribute(new Float32Array(vertices.length * 3), 3);
      colorsAttribute = new THREE.BufferAttribute(new Float32Array(colors.length * 3), 3);

      for (let i = 0; i < vertices.length; i++) {
        verticesAttribute.setXYZ(i, vertices[i][0], vertices[i][1], vertices[i][2]);
        colorsAttribute.setXYZW(i, colors[i][0], colors[i][1], colors[i][2], 1);
      }
      geometry = new THREE.BufferGeometry();
      geometry.dynamic = true;
      geometry.addAttribute('position', verticesAttribute);
      geometry.addAttribute('color', colorsAttribute);
      geometry.attributes.position.dynamic = true;
      geometry.attributes.color.dynamic = true;
      geometry.computeBoundingBox();
      geometry.computeVertexNormals();
    }

    worldObject.geometry = geometry;
    worldObject.vertices = verticesAttribute;
    worldObject.colors = colorsAttribute;

    chunk.previousVerticesLength = vertices.length;
    chunk.needsUpdate = false;

    return geometry;
  }

  /**
   * Resets faces of block
   */
  resetFaces () {
    const chunk = this._worldObject.chunk;
    if (!chunk.inited) {
      throw new Error('Chunk hasn\'t initialized');
    }
    // resetting last 6 bits of block (faces bits)
    for (let i = 0; i < chunk.blocks.length; ++i) {
      chunk.blocks[ i ] &= 0xFFFFFFC0; // 11111111111111111111111111000000
    }
  }

  /**
   * @returns {{vertices: number[][], colors: number[][]}}
   * @private
   */
  async computeVertices (bs) {
    let chunk = this._worldObject.chunk;

    let context = {
      chunkBlocks: chunk.blocks,
      chunkType: chunk.type,
      chunkSize: chunk.size,
      bs,
      WorldChunkType: WorldChunkType.getPlainObject(),
      renderNegY: true
    };

    if (!window.Worker) {
      return computeVertices( context );
    }

    roundRobinIndex++;
    roundRobinIndex %= mesherWorkers.length;

    return mesherWorkers[ roundRobinIndex ].postMessage( context );
  }
}
