<script>
  import RoyalNetworkConnection from "../components/utils/RoyalNetworkConnection";
  export default {
    name: 'game-page',

    transition: {
      name: 'page',
      mode: 'out-in'
    },

    components: {
      MdFavoriteBorder: () => import(/* webpackChunkName: "pages/game-page" */ 'md-svg-vue/dist/action/MdFavoriteBorder.vue'),

      RoyalTargetBar: () => import(/* webpackChunkName: "pages/game-page" */ '../components/RoyalTargetBar'),
      RoyalNetworkConnection: () => import(/* webpackChunkName: "pages/game-page" */ '../components/utils/RoyalNetworkConnection')
    },

    data: () => ({}),
  };
</script>

<template>
  <div class="game-ui">
    <royal-target-bar></royal-target-bar>

    <royal-network-connection></royal-network-connection>
  </div>
</template>

<style lang="scss">
  @import "../styles/components/pages/game-ui";
</style>
