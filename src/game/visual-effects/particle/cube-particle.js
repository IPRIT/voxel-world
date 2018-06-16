import { Particle } from './particle';

let geometry = new THREE.BoxBufferGeometry( 1, 1, 1 );

export class CubeParticle extends Particle {

  constructor ({ size = 1, color = 0xffffff } = {}) {
    let material = new THREE.MeshLambertMaterial({ color, transparent: true });
    super( geometry, material );
  }
}
