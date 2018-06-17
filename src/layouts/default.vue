<template>
  <div>
    <r-scene></r-scene>
    <nuxt></nuxt>
  </div>
</template>

<script>
  import GamePage from "../pages/GamePage";
  import RScene from "../components/RoyalScene";

  export default {
    components: {
      RScene,
      GamePage
    }
  };
</script>

<style lang="scss">
  @import "../styles/common/index";
</style>
