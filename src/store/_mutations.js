export const SET_TARGET = 'SET_TARGET';

export const mutations = {
  [SET_TARGET] (state, target = {}) {
    state.target = target;
  }
};
