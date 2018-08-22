import { get } from "../util/api-utils";

/**
 * @param {string} provider
 * @return {string}
 */
const endpoint = '/user/me';

/**
 * @param {*} axios
 * @param {Object} params
 * @return {*}
 */
export function getMe (axios, params) {
  return get( axios, endpoint, params );
}
