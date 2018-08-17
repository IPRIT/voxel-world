<script>
  import { translate } from "../game/utils/i18n";

  export default {
    name: 'royal-start-menu',

    computed: {
      quickPlayText () {
        return translate( 'resource_loading' );
      }
    }
  };
</script>

<template>
  <div class="start-menu">
    <div>
      Voxel Royal
    </div>
    <hr>
    <div>
      <nuxt-link :to="{ name: 'play' }">{{ quickPlayText }}</nuxt-link>
    </div>
  </div>
</template>

<style lang="scss">
  @import "../styles/components/start-menu";
</style>
