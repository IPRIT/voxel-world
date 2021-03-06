export function optionsFactory () {

  // HSL color ranges
  const h1 = 0;
  const h2 = 0;

  const s1 = 0;
  const s2 = 0;

  const l1 = 100;
  const l2 = 100;

  return {
    duration: 1500,
    timeScale: 1,
    attachToTarget: true,
    particleSystemOptions: {
      timeScale: .5,
      spawnRate: .15,
      maxParticlesNumber: 50,
      attachParticlesToLocal: true,
      particleOptions: {
        generateContext: () => {
          return {
            x: Math.random() * 2 - 1,
            y: Math.random() * 2 - 1,
            z: Math.random() * 2 - 1
          };
        },
        colorRange: [
          new THREE.Vector3( h1 / 360, s1 / 100, l1 / 100 ),
          new THREE.Vector3( h2 / 360, s2 / 100, l2 / 100 )
        ],
        isHSLRange: true,
        lifetime: 150,
        velocity: (context) => {
          return new THREE.Vector3( context.x, 0, context.z )
            .normalize()
            .multiplyScalar( 100 )
            .setY( 30 );
        },
        rotationVelocity: (context) => {
          return new THREE.Vector3( context.x, context.y, context.z );
        },
        positionOffset: (context) => {
          return new THREE.Vector3( -context.x, 0, -context.z )
            .normalize()
            .multiplyScalar( 10 );
        },
        acceleration: (context) => {
          return new THREE.Vector3( -context.x, 10, -context.z )
            .normalize()
            .multiplyScalar( 200 )
            .setY( 20 );
        },
        scale: () => {
          return Math.random() * 2 + .5;
        }
      }
    }
  };
}

export const options = optionsFactory();
