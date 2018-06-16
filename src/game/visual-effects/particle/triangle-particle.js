import { Particle } from './particle';

let geometry = new THREE.CylinderBufferGeometry( 1, 0, 1, 3, 1 );

export class TriangleParticle extends Particle {

  constructor ({ size = 1, color = 0xffffff } = {}) {
    let material = new THREE.MeshLambertMaterial({ color });
    super( geometry, material );
  }
}
