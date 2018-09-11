import * as mutations from "./mutations";
import { MatchMaking } from "../../game/network/matchmaking";

export const actions = {
  startQueue ({ commit }, params) {
    commit( mutations.SET_QUEUE_STATE, true );
    commit( mutations.SET_QUEUE_PARAMS, params );

    const matchmaking = MatchMaking.getInstance();
    return matchmaking.findServer( params ).catch(_ => {
      commit( mutations.SET_QUEUE_STATE, false );
      commit( mutations.SET_QUEUE_PARAMS, null );
    });
  },

  stopQueue ({ commit }) {
    const matchmaking = MatchMaking.getInstance();
    if (matchmaking.queue) {
      matchmaking.queue.leaveQueue();
    }

    commit( mutations.SET_QUEUE_STATE, false );
    commit( mutations.SET_QUEUE_PARAMS, null );
  }
};
