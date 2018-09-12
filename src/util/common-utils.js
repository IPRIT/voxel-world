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
