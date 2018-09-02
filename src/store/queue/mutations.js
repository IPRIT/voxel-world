export const SET_QUEUE_STATE = 'SET_QUEUE_STATE';
export const SET_QUEUE_PARAMS = 'SET_QUEUE_PARAMS';

export const mutations = {
  [SET_QUEUE_STATE] (state, value) {
    state.queueActive = value;
  },

  [SET_QUEUE_PARAMS] (state, params) {
    state.queueParams = params;
  }
};
