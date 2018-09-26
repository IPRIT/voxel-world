<script>
  import { translate } from "../util/i18n";

  export default {
    name: 'royal-class-name',

    props: {
      livingObject: Object
    },

    computed: {
      classes () {
        return {
          'class-name': true,
          [this.displayTypeName]: true
        };
      },

      displayTypeName () {
        if (!this.livingObject) {
          return '';
        }

        if (this.livingObject.isPlayer) {
          return this.livingObject.characterTypeName;
        }

        return this.livingObject.livingObjectTypeName;
      },

      displayName () {
        return translate( this.displayTypeName );
      }
    }
  };
</script>

<template>
  <div :class="classes">
    <div class="class-name__icon"></div>
    <div class="class-name__text" :title="displayName">{{ displayName }}</div>
  </div>
</template>

<style lang="scss">
  @import "../styles/components/class-name";
</style>
