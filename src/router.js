import Vue from 'vue';
import Router from 'vue-router';

import GamePage from '~/pages/GamePage';
import AbstractPage from '~/pages/AbstractPage';

Vue.use(Router);

// Last slash workaround for seo
const beforeEnter = (to, from, next) => {
  // eslint-disable-next-line prefer-const
  let { path, params, query, hash } = to;
  if (!/\/$/i.test(path)) {
    path += '/';
    return next({ path, params, query, hash });
  }
  next();
};

export function createRouter (context) {
  const router = new Router({
    mode: 'history',
    scrollBehavior,

    routes: [{
      name: 'index',
      path: '/',
      component: GamePage,
      meta: { scrollToTop: true }
    }]
  });

  router.beforeEach(beforeEnter);

  return router;
}

// scrollBehavior:
// - only available in html5 history mode
// - defaults to no scroll behavior
// - return false to prevent scroll
const scrollBehavior = (to, from, savedPosition) => {
  if (savedPosition) {
    // savedPosition is only available for popstate navigations.
    return savedPosition;
  } else {
    const position = {};

    // scroll to anchor by returning the selector
    if (to && to.hash) {
      position.selector = to.hash;

      if (document.querySelector(to.hash)) {
        return position;
      }

      // if the returned position is falsy or an empty object,
      // will retain current scroll position.
      return false;
    }

    if (to && to.matched.some(m => m.meta.scrollToTop)) {
      // coords will be used if no selector is provided,
      // or if the selector didn't match any element.
      position.x = 0;
      position.y = 0;
    }
  }
};
