<script>
  import RoyalClassName from "./RoyalClassName";

  export default {
    name: 'royal-target-bar',

    components: {
      RoyalClassName
    },

    props: {
      open: Boolean
    },

    computed: {
      classes () {
        return {
          'target-bar': true,
          'target-bar_opened': this.open,
          'mystic': true
        };
      }
    }
  };
</script>

<template>
  <div :class="classes">
    <div class="target-bar__inner">
      <div class="target-bar__image-wrap">
        <div class="target-bar__image"></div>
      </div>
      <div class="target-bar__target-info">
        <div class="target-bar__target-name-row">
          <div class="target-bar__target-name">Лисёнок</div>
          <div class="target-bar__target-class">
            <royal-class-name :classType="1"></royal-class-name>
          </div>
        </div>

        <div class="target-bar__indicators">
          <div class="target-bar__indicator-bar target-bar__indicator-bar_health">
            <div class="target-bar__indicator-value" style="width: 70%;"></div>
          </div>
          <div class="target-bar__indicator-bar target-bar__indicator-bar_energy">
            <div class="target-bar__indicator-value" style="width: 40%;"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @import "../styles/components/target-bar";
</style>
