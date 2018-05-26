import { Particle } from './particle';

export class TriangleParticle extends Particle {

  constructor ({ size = 1, color = 0xffffff } = {}) {
    let geometry = new THREE.CylinderBufferGeometry( size, 0, size, 3, 1 );
    let material = new THREE.MeshLambertMaterial({ color });
    super( geometry, material );
  }
}
