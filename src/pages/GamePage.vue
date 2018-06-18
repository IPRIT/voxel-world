<script>
  export default {
    name: 'game-page',

    transition: {
      name: 'page',
      mode: 'out-in'
    },

    components: {
      MdFavoriteBorder: () => import(/* webpackChunkName: "pages/game-page" */ 'md-svg-vue/dist/action/MdFavoriteBorder.vue'),

      RoyalTargetBar: () => import(/* webpackChunkName: "pages/game-page" */ '../components/RoyalTargetBar')
    },

    data: () => ({}),
  };
</script>

<template>
  <div class="game-ui">
    <royal-target-bar></royal-target-bar>
  </div>
</template>

<style lang="scss">
  @import "../styles/components/pages/game-ui";
</style>
