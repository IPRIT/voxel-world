/**
 * @param axios
 * @param endpoint
 * @param params
 * @return {*|{}}
 */
export function post (axios, endpoint, params) {
  return axios.post( endpoint, params ).then( onResponse );
}

/**
 * @param axios
 * @param endpoint
 * @param params
 * @return {*}
 */
export function get (axios, endpoint, params) {
  return axios.get( endpoint, { params } ).then( onResponse );
}

/**
 * @param response
 * @return {*}
 */
function onResponse (response) {
  return response.data;
}
