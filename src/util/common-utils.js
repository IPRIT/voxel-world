import { config } from '../config';

/**
 * @return {string}
 */
export function resolveProtocol () {
  const isProduction = config.env === 'production';
  if (typeof window === 'undefined') {
    return 'http' + ( isProduction ? 's' : '' );
  }
  // location protocol may have different values such as `https:`, `http:` etc.
  return location.protocol.startsWith( 'https' ) ? 'https' : 'http';
}

// Class for creating multi inheritance.
export class Multi {

  // Inherit method to create base classes.
  static inherit (...bases) {

    class classes {

      // The base classes
      get base () {
        return bases;
      }

      constructor (...args) {
        let index = 0;

        for (let b of this.base) {
          let obj = new b( args[ index++ ] );
          Multi.copy( this, obj );
        }
      }

    }

    // Copy over properties and methods
    for (let base of bases) {
      Multi.copy( classes, base );
      Multi.copy( classes.prototype, base.prototype );
    }

    return classes;
  }

  // Copies the properties from one class to another
  static copy (_target, _source) {
    for (let key of Reflect.ownKeys( _source )) {
      if (key !== "constructor" && key !== "prototype" && key !== "name") {
        let desc = Object.getOwnPropertyDescriptor( _source, key );
        Object.defineProperty( _target, key, desc );
      }
    }
  }
}
