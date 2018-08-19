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
 * @param {string} accessToken
 * @param {string} authProvider
 * @return {*}
 */
export function authenticate (axios, accessToken, authProvider = 'guest') {
  return post( axios, endpoint( authProvider ), { accessToken } );
}
