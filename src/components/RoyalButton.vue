<script>
  export default {
    name: 'royal-button',

    methods: {
      onClick (ev) {
        this.$emit( 'click', ev );
      }
    }
  };
</script>

<template>
  <button class="royal-button" @click="onClick">
    <slot></slot>
  </button>
</template>

<style lang="scss">
  @import "../styles/components/button";
</style>
