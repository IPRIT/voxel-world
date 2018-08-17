import Router from 'vue-router';

import IndexPage from '~/pages/IndexPage';
import GamePage from '~/pages/GamePage';

import { scrollBehavior } from "./utils";

/**
 * @param context
 * @return {Router}
 */
export function createRouter (context) {
  return new Router({
    mode: 'history',
    scrollBehavior,

    routes: [{
      name: 'index',
      path: '/',
      component: IndexPage
    }, {
      name: 'play',
      path: '/play',
      component: GamePage,
      meta: { scrollToTop: true }
    }]
  });
}
