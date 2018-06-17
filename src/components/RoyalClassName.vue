<script>
  import { translate } from "../game/utils/i18n";

  export default {
    name: 'royal-class-name',

    props: {
      classType: Number
    },

    computed: {
      classes () {
        return {
          'class-name': true
        };
      },

      className () {
        return translate( 'mystic' );
      }
    }
  };
</script>

<template>
  <div :class="classes">
    <div class="class-name__icon"></div>
    <div class="class-name__text">{{ className }}</div>
  </div>
</template>

<style lang="scss">
  @import "../styles/components/class-name";
</style>
