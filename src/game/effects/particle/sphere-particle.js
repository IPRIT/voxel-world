import { Particle } from './particle';

export class SphereParticle extends Particle {

  constructor ({ size = 1, color = 0xffffff } = {}) {
    let geometry = new THREE.SphereBufferGeometry( size, 10, 10, );
    let material = new THREE.MeshLambertMaterial({ color });
    super( geometry, material );
  }
}
