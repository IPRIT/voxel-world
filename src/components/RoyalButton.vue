<script>
  export default {
    name: 'royal-button',

    props: {
      disabled: Boolean
    },

    methods: {
      onClick (ev) {
        this.$emit( 'click', ev );
      }
    }
  };
</script>

<template>
  <button class="royal-button"
          @click="onClick"
          :disabled="disabled">
    <slot></slot>
  </button>
</template>

<style lang="scss">
  @import "../styles/components/button";
</style>
