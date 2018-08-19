<script>
  import { translate } from "../game/utils/i18n";
  import RoyalGoogleButton from "./RoyalGoogleButton";
  import RoyalFacebookButton from "./RoyalFacebookButton";

  export default {
    name: 'royal-start-menu',
    components: {
      RoyalGoogleButton,
      RoyalFacebookButton
    },
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

      <div style="margin: 32px auto; max-width: 300px;">
        <RoyalGoogleButton style="margin-bottom: 16px;"/>
        <RoyalFacebookButton v-for="a in 1" :key="a" style="margin-bottom: 16px;"/>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @import "../styles/components/start-menu";
</style>
