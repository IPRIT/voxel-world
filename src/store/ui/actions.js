import * as mutations from "./mutations";

export const actions = {
  setCharacterSelectorState ({ commit }, state) {
    commit( mutations.SET_CHARACTER_SELECTOR_STATE, state );
  }
};
