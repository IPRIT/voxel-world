/**
 * @param {Map} nonreactive
 * @param {string[]|string} props
 * @return {Object}
 */
export function nonreactiveMapGetter (nonreactive, props) {
  if (!Array.isArray(props)) {
    props = [].concat( props );
  }

  const object = {};
  for (const prop of props) {
    object[ prop ] = {
      get () {
        return nonreactive.get( prop );
      },
      set (value) {
        nonreactive.set( prop, value );
      }
    };
  }

  return object;
}
