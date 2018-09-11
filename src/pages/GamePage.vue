<script>
  import RoyalGameLoading from '../components/RoyalGameLoading';

  const RoyalGame = () => ({
    // The component to load (should be a Promise)
    component: import(/* webpackChunkName: "components/royal-game" */ '../components/RoyalGame'),
    // A component to use while the async component is loading
    loading: RoyalGameLoading,
    // Delay before showing the loading component. Default: 200ms.
    delay: 0,
    // The error component will be displayed if a timeout is
    // provided and exceeded. Default: Infinity.
    timeout: 100000
  });

  export default {
    name: 'game-page',

    components: {
      RoyalGame
    },

    transition: {
      name: 'page',
      mode: 'out-in'
    },

    async asyncData ({ store, redirect } = {}) {
      const { dispatch } = store;
      const server = await dispatch( 'game/restoreServer' );

      if (!server) {
        return redirect({ name: 'index' });
      }
    }
  };
</script>

<template>
  <div class="game-page">
    <royal-game></royal-game>
  </div>
</template>

<style lang="scss">
  @import "../styles/components/pages/game";
</style>
