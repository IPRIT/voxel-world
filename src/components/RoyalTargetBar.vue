<script>
  import RoyalClassName from "./RoyalClassName";
  import { mapState } from 'vuex';

  export default {
    name: 'royal-target-bar',

    components: {
      RoyalClassName
    },

    computed: {
      ...mapState({
        target: state => state.target
      }),

      className () {
        return this.target && this.target.className || '';
      },

      classes () {
        return {
          'target-bar': true,
          'target-bar_opened': !!this.target,
          [this.className]: true
        };
      },

      healthPercent () {
        if (!this.target) {
          return 0;
        }
        const { target } = this;
        return Math.floor( target.health / target.maxHealth * 100 );
      },

      energyPercent () {
        if (!this.target) {
          return 0;
        }
        const { target } = this;
        return Math.floor( target.energy / target.maxEnergy * 100 );
      }
    }
  };
</script>

<template>
  <div :class="classes">
    <div class="target-bar__inner">
      <div class="target-bar__image-wrap" v-if="target">
        <div class="target-bar__image"></div>
      </div>
      <div class="target-bar__target-info" v-if="target">
        <div class="target-bar__target-name-row">
          <div class="target-bar__target-name" :title="target.name">{{ target.name }}</div>
          <div class="target-bar__target-class">
            <royal-class-name :livingObject="target"></royal-class-name>
          </div>
        </div>

        <div class="target-bar__indicators">
          <div class="target-bar__indicator-bar target-bar__indicator-bar_health">
            <div class="target-bar__indicator-value" :style="{ width: `${this.healthPercent}%` }"></div>
          </div>
          <div class="target-bar__indicator-bar target-bar__indicator-bar_energy">
            <div class="target-bar__indicator-value" :style="{ width: `${this.energyPercent}%` }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @import "../styles/components/target-bar";
</style>
