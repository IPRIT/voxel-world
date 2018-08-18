<script>
  import MdClear from 'md-svg-vue/dist/content/MdClear.vue';

  import { GoogleManager } from "../util/auth/google-manager";
  import { config } from '../config';
  import { nonreactiveMapGetter } from "../util/vue-utils";

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
      isSignedIn: false,
      googleUser: null,

      resetHover: false,
      resetHoverDelay: null,
      resetHoverDelayMs: 200,

      test: false
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
        }).then(auth => {
          // Listen for sign-in state changes.
          auth.isSignedIn.listen( this.signInChanged.bind( this ) );

          // Listen for changes to current user.
          auth.currentUser.listen( this.userChanged.bind( this ) );

          // Sign in the user if they are currently signed in.
          /*if (auth.isSignedIn.get() == true) {
            auth.signIn();
          }*/

          this.authInstance = auth;
        });
      },

      signInChanged (isSignedIn) {
        console.log( 'isSignedIn', isSignedIn );
        this.isSignedIn = isSignedIn;
      },

      userChanged (user) {
        console.log( 'user', user );

        if (!user) {
          return;
        }

        this.googleUser = user;

        const profile = user.getBasicProfile();
        console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
        console.log('Name: ' + profile.getName());
        console.log('Image URL: ' + profile.getImageUrl());
        console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
      },

      onResetMouseEnter () {
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
      ...nonreactiveMapGetter(nonreactive, [
        'authInstance'
      ]),

      classes () {
        return {
          'google-sign-in_no-reset': !this.shouldRenderResetButton
        };
      },

      shouldRenderResetButton () {
        return !this.test;
      }
    },

    watch: {
      shouldRenderResetButton (value) {
        if (!value) {
          this.resetHover = false;
        }
      }
    }
  };
</script>

<template>
  <div class="google-sign-in" :class="classes">

    <button class="google-sign-in__button">
      <span class="google-sign-in__button-icon">
        <img class="google-sign-in__button-icon-img" src="~/assets/ui/icons/google@1x.png" />
      </span>
      <span class="google-sign-in__button-text" :class="{ 'google-sign-in__button-text_hidden': resetHover }">
        <span>Продолжить как Александр Белов</span>
      </span>

      <transition name="slide-x-reverse-transition">
        <span class="google-sign-in__button-overlay" v-show="resetHover">
          <span class="google-sign-in__button-overlay-text">Войти под другим аккаунтом</span>
        </span>
      </transition>
    </button>

    <button class="google-sign-in__button google-sign-in__button_reset-auth"
            @mouseenter="onResetMouseEnter"
            @mouseleave="onResetMouseLeave" @click="test = !test">
      <md-clear></md-clear>
    </button>
  </div>
</template>

<style lang="scss">
  @import "../styles/components/google-sign-in";
</style>
