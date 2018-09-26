export const SET_CHARACTER_SELECTOR_STATE = 'SET_CHARACTER_SELECTOR_STATE';

export const mutations = {
  [SET_CHARACTER_SELECTOR_STATE] (state, value = true) {
    state.characterSelectorActive = value;
  }
};
