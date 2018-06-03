/**
 * @returns {{duration: number, attachToTarget: boolean, particleSystemOptions: {attachParticlesToLocal: boolean, timeScale: number, spawnRate: number, maxParticlesNumber: number, particleOptions: {generateContext: (function(): {x: number, y: number, z: number}), colorRange: *[], isHSLRange: boolean, lifetime: number, velocity: (function(*): *), rotationVelocity: (function(*): THREE.Vector3), positionOffset: (function(*): *), acceleration: (function(*): *), scale: (function(): number)}}, transitionOptions: {timeScale: number, velocity: number, acceleration: number}}}
 */
export function optionsFactory () {

  // HSL color ranges
  const h1 = 5;
  const h2 = 15;

  const s1 = 100;
  const s2 = 100;

  const l1 = 10;
  const l2 = 51;

  return {
    duration: 0,
    timeScale: 1,
    attachToTarget: false,
    particleSystemOptions: {
      timeScale: .5,
      spawnRate: .2,
      maxParticlesNumber: 30,
      attachParticlesToLocal: true,
      rotationVelocity: new THREE.Vector3(0, 0, -.2),
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
        lifetime: 220,
        velocity: (context) => {
          return new THREE.Vector3( -context.x, -context.y, -context.z )
            .normalize()
            .multiplyScalar( 50 )
        },
        rotationVelocity: (context) => {
          return new THREE.Vector3( context.x, context.y, context.z )
        },
        positionOffset: (context) => {
          return new THREE.Vector3( -context.x, -context.y, -context.z )
            .normalize()
            .multiplyScalar( 2 )
        },
        acceleration: (context) => {
          return new THREE.Vector3( context.x, context.y, context.z )
            .normalize()
            .multiplyScalar( 10 )
        },
        scale: () => {
          return Math.random() * 2.5 + .5;
        }
      }
    },
    transitionOptions: {
      timeScale: 1,
      velocity: 120,
      acceleration: .5
    }
  };
}

export const options = optionsFactory();
