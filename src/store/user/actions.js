import * as mutations from "./mutations";
import { authenticate, getMe } from "../../api";
import { SOCIAL_AUTH_TOKEN } from "./defaults";
import { storage } from "../../util/storage";

export const actions = {
  restoreSession ({ dispatch }) {
    const token = storage.getItem( SOCIAL_AUTH_TOKEN );
    if (!token) {
      return;
    }

    dispatch( 'setToken', token );
    return dispatch( 'fetchMe' );
  },

  fetchMe ({ state, commit, dispatch }) {
    const token = state.token;
    return getMe( this.$axios, { token }).then(({ response }) => {
      commit( mutations.SET_ME, response );
      return response;
    }).catch(error => {
      console.error( error );
      dispatch( 'resetSession' );
    });
  },

  resetMe ({ commit }) {
    commit( mutations.RESET_ME );
  },

  storeSession ({ dispatch }, token) {
    storage.setItem( SOCIAL_AUTH_TOKEN, token );
    dispatch( 'setToken', token );
  },

  resetSession ({ dispatch }) {
    dispatch( 'resetToken' );
    dispatch( 'resetMe' );
  },

  setToken ({ commit }, token = null) {
    commit( mutations.SET_TOKEN, token );
  },

  resetToken ({ commit }) {
    storage.removeItem( SOCIAL_AUTH_TOKEN );
    commit( mutations.RESET_TOKEN );
  },

  setNickname ({ commit }, nickname) {
    commit( mutations.SET_NICKNAME, nickname );
  },

  authenticate ({ dispatch }, { params = {}, provider = 'guest' }) {
    return authenticate( this.$axios, params, provider ).then(({ response }) => {
      const token = response.token;
      dispatch( 'storeSession', token );
      return token;
    });
  }
};
