/**
 * - only available in html5 history mode
 * - defaults to no scroll behavior
 * - return false to prevent scroll
 *
 * @param to
 * @param from
 * @param savedPosition
 * @return {*}
 */
export function scrollBehavior (to, from, savedPosition) {
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
}
