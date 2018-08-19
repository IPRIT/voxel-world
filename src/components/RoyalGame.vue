<script>
  export default {
    name: 'royal-game',

    components: {
      RoyalScene: () => import(/* webpackChunkName: "components/royal-game" */ './RoyalScene'),
      RoyalGameUi: () => import(/* webpackChunkName: "components/royal-game" */ './RoyalGameUI')
    }
  };
</script>

<template>
  <div class="game">
    <RoyalGameUi/>
    <RoyalScene/>
  </div>
</template>

<style lang="scss">
  @import "../styles/components/game";
</style>
