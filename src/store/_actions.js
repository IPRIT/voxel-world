import * as mutations from "./_mutations";

export const actions = {
  setTarget ({ commit }, target) {
    console.log( target );
    commit( mutations.SET_TARGET, target );
  },

  resetTarget ({ commit }) {
    commit( mutations.SET_TARGET, null );
  }
};
