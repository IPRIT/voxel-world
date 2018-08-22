import { post } from "../util/api-utils";

/**
 * @param {string} provider
 * @return {string}
 */
const endpoint = provider => {
  return `/user/authenticate/${provider}`;
};

/**
 * @param {*} axios
 * @param {Object} params
 * @param {string} authProvider
 * @return {*}
 */
export function authenticate (axios, params, authProvider = 'guest') {
  return post( axios, endpoint( authProvider ), params );
}
