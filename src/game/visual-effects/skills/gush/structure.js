import { FountainEffect } from "../components/gush/fountain";
import { TornadoEffect } from "../components/common/tornado";
import { ShockWaveEffect } from "../components/common/shock-wave";

const h1 = 206;
const h2 = 206;

const s1 = 93;
const s2 = 93;

const l1 = 33;
const l2 = 66;

export const structure = [{
  effect: FountainEffect,
  effectOptions: {
    particleSystemOptions: {
      particleOptions: {
        colorRange: [
          new THREE.Vector3(h1 / 360, s1 / 100, l1 / 100),
          new THREE.Vector3(h2 / 360, s2 / 100, l2 / 100)
        ]
      }
    }
  }
}, {
  effect: ShockWaveEffect,
  effectOptions: {
    particleSystemOptions: {
      particleOptions: {
        colorRange: [
          new THREE.Vector3(h1 / 360, s1 / 100, 55 / 100),
          new THREE.Vector3(h2 / 360, s2 / 100, 80 / 100)
        ]
      }
    }
  }
}, {
  effect: TornadoEffect,
  effectOptions: {
    particleSystemOptions: {
      maxParticlesNumber: 10,
      spawnRate: .05,
      rotationVelocity: new THREE.Vector3(0, .1, 0),
      particleOptions: {
        colorRange: [
          new THREE.Vector3(h1 / 360, s1 / 100, 10 / 100),
          new THREE.Vector3(h2 / 360, s2 / 100, 80 / 100)
        ],
        lifetime: 550,
        velocity: (context) => {
          return new THREE.Vector3( context.x, 0, context.z )
            .normalize()
            .multiplyScalar( 10 )
            .setY( Math.abs( context.y * 15 ) )
        },
        rotationVelocity: (context) => {
          return new THREE.Vector3( context.x, context.y, context.z )
            .multiplyScalar( .5 )
        },
      }
    }
  }
}];
