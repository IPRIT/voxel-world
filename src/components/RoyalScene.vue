<script>
  export default {
    name: 'royal-scene',

    mounted () {
      window.THREE = require('three');
      window.THREEx = require('../game/libs/threex.keyboardstate').default;
      require('three/examples/js/controls/TransformControls.js');
      window.dat = require('dat.gui');

      const game = require('../main');
      game.run();
    }
  };
</script>

<template>
  <div class="game-scene"></div>
</template>
