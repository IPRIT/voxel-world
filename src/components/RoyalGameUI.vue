<script>
  import RoyalTargetBar from '../components/RoyalTargetBar';
  import RoyalNetworkConnection from '../components/utils/RoyalNetworkConnection';
  import RoyalCharacterSelector from '../components/RoyalCharacterSelector';

  export default {
    name: 'royal-game-ui',

    components: {
      RoyalTargetBar,
      RoyalNetworkConnection,
      RoyalCharacterSelector,
    }
  };
</script>

<template>
  <div class="game-ui"
       @click.stop="() => {}"
       @mousedown.stop="() => {}">
    <RoyalTargetBar />
    <RoyalNetworkConnection />
    <RoyalCharacterSelector />
  </div>
</template>

<style lang="scss">
  @import "../styles/components/game-ui";
</style>
