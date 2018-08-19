<script>
  import MdClear from 'md-svg-vue/dist/content/MdClear.vue';
  import Promise from 'bluebird';

  import { FacebookManager } from "../util/auth";
  import { config } from '../config';
  import { authenticate } from "../api";
  import { translate } from "../game/utils/i18n";

  export default {
    name: 'royal-facebook-button',

    components: {
      MdClear
    },

    data: () => ({
      isPlatformLoaded: false,
      isAuthenticating: false,
      isSignedIn: false,

      facebookToken: null,
      facebookBasicProfile: null,

      resetHover: false,
      resetHoverDelay: null,
      resetHoverDelayMs: 200,

      autoLoginAfterPlatformLoaded: false
    }),

    mounted () {
      this.initialize();
    },

    methods: {
      initialize () {
        const facebookManager = FacebookManager.getManager();
        return facebookManager.loadPlatform().then(platform => {
          return this.onPlatformLoaded( platform );
        });
      },

      onPlatformLoaded (platform) {
        platform.init({
          appId: config.facebook.appId,
          xfbml: true,
          status: true,
          version: config.facebook.sdkVersion
        });

        return this.getLoginStatus().then(loginStatus => {
          return this.updateLoginStatus( loginStatus );
        });
      },

      updateLoginStatus (loginStatus) {
        if (loginStatus.status === 'connected') {
          const { authResponse = {} } = loginStatus;
          const { accessToken = '' } = authResponse;

          this.isSignedIn = true;
          this.facebookToken = accessToken;

          return this.getMe().then(me => {
            this.facebookBasicProfile = me;
            this.isPlatformLoaded = true;

            if (this.autoLoginAfterPlatformLoaded
              && this.canAuthenticate) {
              return this.authenticate();
            }
          });
        } else {
          this.isSignedIn = false;
          this.isPlatformLoaded = true;
        }
      },

      getLoginStatus () {
        return new Promise(resolve => {
          this.platform.getLoginStatus( resolve );
        });
      },

      getMe () {
        return new Promise(resolve => {
          this.platform.api( '/me', resolve );
        });
      },

      signIn (scope = [ 'public_profile', 'email' ]) {
        return new Promise(resolve => {
          this.platform.login(resolve, {
            scope: scope.join(',')
          });
        });
      },

      logout () {
        return new Promise(resolve => {
          this.platform.logout( resolve );
        });
      },

      async handleSignIn () {
        if (!this.isPlatformLoaded) {
          return ( this.autoLoginAfterPlatformLoaded = true );
        }
        // if we have facebook token we should authenticate
        if (this.canAuthenticate) {
          return this.authenticate();
        }

        return this.signIn().then(response => {
          return this.updateLoginStatus( response );
        }).then(_ => {
          if (this.canAuthenticate) {
            return this.authenticate();
          }
        });
      },

      async authenticate () {
        if (this.isAuthenticating) {
          return;
        }
        this.isAuthenticating = true;
        return authenticate( this.$axios, this.facebookToken, 'facebook' ).then(({ response }) => {
          const { token } = response;
          this.$emit( 'token', token );
        }).finally(_ => {
          this.isAuthenticating = false;
        });
      },

      resetAuth () {
        if (this.isAuthenticating) {
          return;
        }

        this.isSignedIn = false;
        this.facebookBasicProfile = null;
        this.facebookToken = null;

        return this.logout();
      },

      onResetMouseEnter () {
        if (!this.isSignedIn) {
          return;
        }
        this.resetHover = true;
        if (this.resetHoverDelay) {
          clearTimeout( this.resetHoverDelay );
          this.resetHoverDelay = null;
        }
      },

      onResetMouseLeave () {
        this.resetHoverDelay = setTimeout(_ => {
          this.resetHover = false;
        }, this.resetHoverDelayMs);
      }
    },

    computed: {
      classes () {
        return {
          'social-sign-in_no-reset': !this.isSignedIn
        };
      },

      platform () {
        const facebookManager = new FacebookManager();
        return facebookManager.platform;
      },

      canAuthenticate () {
        return this.facebookBasicProfile && this.facebookToken;
      },

      platformLoadingText () {
        return translate( 'resource_loading' );
      },

      signInText () {
        return translate( 'social_sign_in_facebook' );
      },

      signInAnotherText () {
        return translate( 'social_sign_in_another' );
      },

      signingInText () {
        return translate( 'social_signing_in' );
      },

      continueAsText () {
        return translate( 'social_continue_as', this.facebookBasicProfile.name);
      }
    },

    watch: {
      isSignedIn (value) {
        if (!value) {
          this.resetHover = false;
          this.resetAuth();
        }
      }
    }
  };
</script>

<template>
  <div class="social-sign-in facebook" :class="classes">

    <button class="social-sign-in__button" @click="handleSignIn">
      <span class="social-sign-in__button-icon">
        <img class="social-sign-in__button-icon-img" src="~/assets/ui/icons/facebook_white@1x.png" />
      </span>
      <span class="social-sign-in__button-text" :class="{ 'social-sign-in__button-text_hidden': resetHover }">
        <transition name="fade-transition" mode="out-in">
          <span v-if="!isPlatformLoaded" key="platform-loading">{{ platformLoadingText }}</span>
          <span v-else-if="isAuthenticating" key="signing-in">{{ signingInText }}</span>
          <span v-else key="rest">
            <span v-if="facebookBasicProfile">{{ continueAsText }}</span>
            <span v-else>{{ signInText }}</span>
          </span>
        </transition>
      </span>

      <transition name="slide-x-reverse-transition">
        <span class="social-sign-in__button-overlay" v-show="resetHover">
          <span class="social-sign-in__button-overlay-text">{{ signInAnotherText }}</span>
        </span>
      </transition>
    </button>

    <button class="social-sign-in__button social-sign-in__reset-button"
            @mouseenter="onResetMouseEnter"
            @mouseleave="onResetMouseLeave"
            @click="resetAuth">
      <md-clear></md-clear>
    </button>
  </div>
</template>

<style lang="scss">
  @import "../styles/components/social-sign-in";
</style>
