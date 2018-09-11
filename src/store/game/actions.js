import * as mutations from "./mutations";
import { storage } from "../../util/storage";
import { STORAGE_SERVER_KEY } from "./defaults";

export const actions = {
  setTarget ({ commit }, target) {
    console.log( target );
    commit( mutations.SET_TARGET, target );
  },

  resetTarget ({ commit }) {
    commit( mutations.SET_TARGET, null );
  },

  joinServer ({ commit, dispatch }, server) {
    dispatch( 'storeServer', server );
    return server;
  },

  restoreServer ({ commit }) {
    const server = storage.getItem( STORAGE_SERVER_KEY );
    if (!server) {
      return;
    }
    commit( mutations.SET_SERVER, server );

    return server;
  },

  storeServer ({ commit }, server) {
    storage.setItem(STORAGE_SERVER_KEY, server, {
      expired: Date.now() + 3600 * 1000
    });
    commit( mutations.SET_SERVER, server );
  }
};
