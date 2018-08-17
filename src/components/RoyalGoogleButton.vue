<script>
  import { GoogleManager } from "../util/auth/google-manager";

  export default {
    name: 'royal-google-button',

    mounted () {
      const googleManager = GoogleManager.getManager();
      googleManager.loadPlatform().then( console.log );
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
