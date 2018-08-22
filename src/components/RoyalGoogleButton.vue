<script>
  import MdClear from 'md-svg-vue/dist/content/MdClear.vue';

  import { GoogleManager } from "../util/auth/google-manager";
  import { config } from '../config';
  import { nonreactiveMapGetter } from "../util/vue-utils";
  import { authenticate } from "../api";
  import { translate } from "../game/utils/i18n";

  const nonreactive = new Map([
    [ 'authInstance', false ]
  ]);

  export default {
    name: 'royal-google-button',

    components: {
      MdClear
    },

    data: () => ({
      nonreactive,

      isPlatformLoaded: false,
      isAuthenticating: false,
      isSignedIn: false,

      googleUser: null,
      googleToken: null,
      googleBasicProfile: null,

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
        const googleManager = GoogleManager.getManager();
        return googleManager.loadAuth2().then(auth2 => {
          return auth2.init({
            client_id: config.google.clientId,
            scope: 'profile email'
          });
        }).then(auth2 => {
          // Listen for sign-in state changes.
          this.signInListener = auth2.isSignedIn.listen( this.onSignInChanged.bind( this ) );

          // Listen for changes to current user.
          this.currentUserListener = auth2.currentUser.listen( this.onGoogleUserChanged.bind( this ) );

          // Sign in the user if they are currently signed in.
          if (auth2.isSignedIn.get() == true) {
            this.onGoogleUserChanged( auth2.currentUser.get(), false );
            this.isSignedIn = true;
          }

          this.authInstance = auth2;
          this.isPlatformLoaded = true;

          if (this.autoLoginAfterPlatformLoaded
            && this.canAuthenticate) {
            this.authenticate();
          }
        });
      },

      onSignInChanged (isSignedIn) {
        this.isSignedIn = isSignedIn;
      },

      onGoogleUserChanged (user, withAuthenticate = true) {
        const auth = user.getAuthResponse();
        const isAuthEmpty = !Object.keys(auth || {}).length;

        if (!user || isAuthEmpty) {
          return;
        }

        const profile = user.getBasicProfile();

        this.googleUser = user;
        this.googleBasicProfile = {
          id: profile.getId(),
          name: profile.getName(),
          email: profile.getEmail(),
          imageUrl: profile.getImageUrl()
        };

        // The ID token we need to pass to our server
        const { id_token = '' } = auth || {};

        if (id_token) {
          this.googleToken = id_token;
        }

        if (withAuthenticate) {
          this.authenticate();
        }
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
      },

      handleSignIn () {
        if (!this.isPlatformLoaded) {
          return ( this.autoLoginAfterPlatformLoaded = true );
        }
        // if we have google token we should authenticate
        if (this.canAuthenticate) {
          return this.authenticate();
        }
        this.authInstance.signIn();
      },

      async authenticate () {
        if (this.isAuthenticating) {
          return;
        }
        this.isAuthenticating = true;
        return authenticate( this.$axios, { accessToken: this.googleToken }, 'google' ).then(({ response }) => {
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

        this.googleUser = null;
        this.googleBasicProfile = null;
        this.googleToken = null;

        if (this.authInstance) {
          this.authInstance.signOut();
        }
      }
    },

    computed: {
      ...nonreactiveMapGetter(nonreactive, [
        'authInstance',
        'signInListener',
        'currentUserListener'
      ]),

      classes () {
        return {
          'social-sign-in_no-reset': !this.isSignedIn
        };
      },

      canAuthenticate () {
        return this.googleUser && this.googleToken;
      },

      platformLoadingText () {
        return translate( 'resource_loading' );
      },

      signInText () {
        return translate( 'social_sign_in_google' );
      },

      signInAnotherText () {
        return translate( 'social_sign_in_another' );
      },

      signingInText () {
        return translate( 'social_signing_in' );
      },

      continueAsText () {
        return translate( 'social_continue_as', this.googleBasicProfile.name);
      }
    },

    watch: {
      isSignedIn (value) {
        if (!value) {
          this.resetHover = false;
          this.resetAuth();
        }
      }
    },

    beforeDestroy () {
      if (this.signInListener) {
        this.signInListener.remove();
      }
      if (this.currentUserListener) {
        this.currentUserListener.remove();
      }
    }
  };
</script>

<template>
  <div class="social-sign-in google" :class="classes">

    <button class="social-sign-in__button" @click="handleSignIn">
      <span class="social-sign-in__button-icon">
        <img class="social-sign-in__button-icon-img" src="~/assets/ui/icons/google@1x.png" />
      </span>
      <span class="social-sign-in__button-text" :class="{ 'social-sign-in__button-text_hidden': resetHover }">
        <transition name="fade-transition" mode="out-in">
          <span v-if="!isPlatformLoaded" key="platform-loading">{{ platformLoadingText }}</span>
          <span v-else-if="isAuthenticating" key="signing-in">{{ signingInText }}</span>
          <span v-else key="rest">
            <span v-if="googleBasicProfile">
              <span>{{ continueAsText }}&nbsp;</span>
              <span>{{ googleBasicProfile.name }}</span>
            </span>
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
