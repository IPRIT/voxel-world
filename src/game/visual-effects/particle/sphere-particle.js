import { Particle } from './particle';

let geometry = new THREE.SphereBufferGeometry( 1, 10, 10, );

export class SphereParticle extends Particle {

  constructor ({ size = 1, color = 0xffffff } = {}) {
    let material = new THREE.MeshLambertMaterial({ color });

    if (size !== geometry.radius) {
      geometry = new THREE.SphereBufferGeometry( size, 10, 10, );
    }

    super( geometry, material );
  }
}
