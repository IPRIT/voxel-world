<script>
  import RoyalGoogleButton from "./RoyalGoogleButton";
  import RoyalFacebookButton from "./RoyalFacebookButton";
  import RoyalButton from "./RoyalButton";

  import { translate } from "../game/utils/i18n";

  export default {
    name: 'royal-start-menu',

    components: {
      RoyalButton,
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

    <div class="start-menu__logo">
      <div style="font-size: 125px;">Voxel</div>
      <div>Royal</div>
    </div>

    <div class="start-menu__menu">

      <div class="start-menu__auth">
        <div class="start-menu__nickname">
          <input type="text" class="start-menu__nickname-input" placeholder="Введите никнейм">
        </div>
      </div>

      <div class="start-menu__divider"></div>

      <div class="start-menu__menu-buttons">
        <RoyalButton class="start-menu__menu-button start-menu__menu-button_quick">Quick Play</RoyalButton>
        <RoyalButton class="start-menu__menu-button start-menu__menu-button_competitive">Competitive Mode</RoyalButton>
      </div>

      <div class="start-menu__divider"></div>

      <div class="start-menu__social-auth">
        <RoyalGoogleButton class="start-menu__social-auth-button"/>
        <RoyalFacebookButton class="start-menu__social-auth-button"/>
      </div>

    </div>

  </div>
</template>

<style lang="scss">
  @import "../styles/components/start-menu";
</style>
