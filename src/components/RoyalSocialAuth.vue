<script>
  import RoyalGoogleButton from "./RoyalGoogleButton";
  import RoyalFacebookButton from "./RoyalFacebookButton";

  import { createNamespacedHelpers } from 'vuex';
  import { translate } from "../util/i18n";

  const userStore = createNamespacedHelpers( 'user' );

  export default {
    name: 'royal-social-auth',

    components: {
      RoyalGoogleButton,
      RoyalFacebookButton
    },

    data: () => ({
      isProcessing: false
    }),

    methods: {
      onTokenReceived (token) {
        this.isProcessing = true;

        this.storeSession( token );
        return this.fetchMe().finally(_ => {
          this.isProcessing = false;
        });
      },

      storeSession (token) {
        const { dispatch } = this.$store;
        dispatch( 'user/storeSession', token );
      },

      fetchMe () {
        const { dispatch } = this.$store;
        return dispatch( 'user/fetchMe' );
      }
    },

    computed: {
      ...userStore.mapState({
        me: state => state.me
      }),

      loadingText () {
        return translate( 'loading' );
      }
    }
  };
</script>

<template>
  <div class="royal-social-auth">
    <transition name="expand-transition">
      <div class="royal-social-auth__loading-overlay" v-show="isProcessing">{{ loadingText }}</div>
    </transition>

    <RoyalGoogleButton class="start-menu__social-auth-button" @token="onTokenReceived"/>
    <RoyalFacebookButton class="start-menu__social-auth-button" @token="onTokenReceived"/>
  </div>
</template>

<style lang="scss">
  @import "../styles/components/social-auth";
</style>
