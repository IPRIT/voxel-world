import { consoleLogNamespaced } from "../util/logger";

const logger = consoleLogNamespaced('Axios');

export default function ({ $axios, req }) {
  $axios.onRequest( onRequest );
  $axios.onError( onError );
}

/**
 * @param {*} config
 */
function onRequest (config) {
  logger.info( 'requesting', config.url, config );
}

/**
 * @param {*} error
 */
function onError (error) {
  const code = parseInt( error.response && error.response.status );
  logger.error( 'error', code, error );
}
