import { Particle } from './particle';

export class CubeParticle extends Particle {

  constructor ({ size = 1, color = 0xffffff } = {}) {
    let geometry = new THREE.CubeGeometry( size, size, size );
    let material = new THREE.MeshLambertMaterial({ color });
    super( geometry, material );
  }
}
