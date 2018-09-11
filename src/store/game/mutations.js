export const SET_TARGET = 'SET_TARGET';
export const SET_SERVER = 'SET_SERVER';

export const mutations = {
  [SET_TARGET] (state, target = {}) {
    state.target = target;
  },
  [SET_SERVER] (state, server) {
    state.server = server;
  }
};
