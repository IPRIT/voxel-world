/**
 * @returns {{duration: number, attachToTarget: boolean, particleSystemOptions: {attachParticlesToLocal: boolean, timeScale: number, spawnRate: number, maxParticlesNumber: number, particleOptions: {generateContext: (function(): {x: number, y: number, z: number}), colorRange: *[], isHSLRange: boolean, lifetime: number, velocity: (function(*): *), rotationVelocity: (function(*): THREE.Vector3), positionOffset: (function(*): *), acceleration: (function(*): *), scale: (function(): number)}}, transitionOptions: {timeScale: number, velocity: number, acceleration: number}}}
 */
export function optionsFactory () {

  // HSL color ranges
  const h1 = 73;
  const h2 = h1 + 10;

  const s1 = 26;
  const s2 = 65;

  const l1 = 55;
  const l2 = 95;

  return {
    duration: 0,
    attachToTarget: false,
    particleSystemOptions: {
      attachParticlesToLocal: false,
      timeScale: .3,
      spawnRate: .1,
      maxParticlesNumber: 40,
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
        lifetime: 120,
        velocity: (context) => {
          return new THREE.Vector3( 0, 35 + 50 * context.y, 0 );
        },
        rotationVelocity: (context) => {
          return new THREE.Vector3( context.x, context.y, context.z )
        },
        positionOffset: (context) => {
          return new THREE.Vector3( context.x, context.y, context.z )
            .multiplyScalar( 2 )
        },
        acceleration: (context) => {
          return new THREE.Vector3( 0, 4 * Math.abs( context.y ) + 10, 0 )
        },
        scale: () => {
          return Math.random() * 1.5 + .5;
        }
      }
    },
    transitionOptions: {
      timeScale: 1,
      velocity: 80,
      acceleration: .5
    }
  };
}

export const options = optionsFactory();
