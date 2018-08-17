<script>
  import RoyalTargetBar from '../components/RoyalTargetBar';
  import RoyalNetworkConnection from '../components/utils/RoyalNetworkConnection';

  export default {
    name: 'royal-game-ui',

    components: {
      RoyalTargetBar,
      RoyalNetworkConnection,
    }
  };
</script>

<template>
  <div class="game-ui">
    <royal-target-bar></royal-target-bar>
    <royal-network-connection></royal-network-connection>
  </div>
</template>

<style lang="scss">
  @import "../styles/components/game-ui";
</style>
