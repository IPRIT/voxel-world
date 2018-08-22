import * as mutations from "./mutations";

export const actions = {
  setTarget ({ commit }, target) {
    console.log( target );
    commit( mutations.SET_TARGET, target );
  },

  resetTarget ({ commit }) {
    commit( mutations.SET_TARGET, null );
  }
};
