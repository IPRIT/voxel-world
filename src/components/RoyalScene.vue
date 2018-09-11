<script>
  export default {
    name: 'royal-scene',

    mounted () {
      window.THREE = require('three');
      window.THREEx = require('../game/libs/threex.keyboardstate').default;
      window.dat = require('dat.gui');
      require('three/examples/js/controls/TransformControls.js');

      const game = require('../game/main');
      game.run( this.$store, this.$router );
    }
  };
</script>

<template>
  <div class="game-scene"></div>
</template>
