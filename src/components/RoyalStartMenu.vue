<script>
  import { translate } from "../game/utils/i18n";
  import RoyalGoogleButton from "./RoyalGoogleButton";

  export default {
    name: 'royal-start-menu',
    components: { RoyalGoogleButton },
    computed: {
      quickPlayText () {
        return translate( 'quick_play' );
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

      <div style="margin: 32px auto; max-width: 500px;">
        <RoyalGoogleButton/>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @import "../styles/components/start-menu";
</style>
