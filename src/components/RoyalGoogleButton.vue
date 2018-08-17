<script>
  import { GoogleManager } from "../util/auth/google-manager";

  export default {
    name: 'royal-google-button',

    mounted () {
      this.initialize();
    },

    methods: {
      initialize () {
        this.createDomCallback();
        const googleManager = GoogleManager.getManager();
        return googleManager.loadPlatform();
      },

      createDomCallback () {
        // <div class="g-signin2" data-onsuccess="onSignIn"></div>
        const randomHash = ( Math.random() * 1e9 ).toString( 16 ).replace('.', '_');
        const fnName = `_sign_in_callback_${randomHash}`;
        const domCallback = document.createElement( 'div' );
        domCallback.className = 'g-signin2';
        domCallback.setAttribute( 'data-onsuccess', fnName );
        domCallback.style.display = 'none';

        this.$el.appendChild( domCallback );

        window[ fnName ] = window[ fnName ] || this.onSignedIn.bind( this );
      },

      signIn () {
        // https://developers.google.com/identity/sign-in/web/build-button?authuser=1
      },

      // could run automatically
      onSignedIn (googleUser) {
        const profile = googleUser.getBasicProfile();
        console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
        console.log('Name: ' + profile.getName());
        console.log('Image URL: ' + profile.getImageUrl());
        console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
      }
    }
  };
</script>

<template>
  <div class="google-sign-in">
    Google Login Button
  </div>
</template>

<style lang="scss">
  @import "../styles/components/start-menu";
</style>
