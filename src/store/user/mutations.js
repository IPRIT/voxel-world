export const SET_TOKEN = 'SET_TOKEN';
export const RESET_TOKEN = 'RESET_TOKEN';
export const SET_ME = 'SET_ME';
export const RESET_ME = 'RESET_ME';
export const SET_NICKNAME = 'SET_NICKNAME';

export const mutations = {
  [SET_TOKEN] (state, token) {
    state.token = token;
  },

  [RESET_TOKEN] (state) {
    state.token = null;
  },

  [SET_ME] (state, me) {
    state.me = me;

    if (me.nickname) {
      state.nickname = me.nickname;
    }
  },

  [RESET_ME] (state) {
    state.me = null;
  },

  [SET_NICKNAME] (state, nickname = 'unknown_player') {
    if (state.me) {
      state.me.nickname = nickname;
    }
    state.nickname = nickname;
  }
};
