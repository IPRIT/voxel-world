/**
 * @returns {{particleSystemOptions: {timeScale: number, spawnRate: number, maxParticlesNumber: number, particleOptions: {generateContext: (function(): {x: number, y: number, z: number}), colorRange: *[], isHSLRange: boolean, lifetime: number, velocity: (function(*): *), rotationVelocity: (function(*): THREE.Vector3), positionOffset: (function(*): *), acceleration: (function(*): *), scale: (function(): number)}}}}
 */
export function optionsFactory () {

  // HSL color ranges
  const h1 = 0;
  const h2 = 0;

  const s1 = 0;
  const s2 = 0;

  const l1 = 100;
  const l2 = 100;

  return {
    duration: 750,
    timeScale: 1,
    attachToTarget: false,
    particleSystemOptions: {
      timeScale: 1.2,
      spawnRate: .7,
      maxParticlesNumber: 40,
      attachParticlesToLocal: false,
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
        lifetime: 1500,
        velocity: (context) => {
          return new THREE.Vector3( context.x, 0, context.z )
            .normalize()
            .multiplyScalar( 30 )
            .setY( Math.abs( context.y ) * 50 + 25 )
        },
        rotationVelocity: (context) => {
          return new THREE.Vector3( context.x, context.y, context.z )
            .multiplyScalar( .3 )
        },
        positionOffset: (context) => {
          return new THREE.Vector3( context.x, context.y, context.z )
            .multiplyScalar( 2 )
        },
        acceleration: new THREE.Vector3( 0, -1.5, 0 ),
        scale: () => {
          return Math.random() * 2 + 1;
        }
      }
    }
  };
}

export const options = optionsFactory();
