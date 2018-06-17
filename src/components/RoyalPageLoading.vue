<script>
  import RLoading from "./RoyalLoading";

  import { createNamespacedHelpers } from 'vuex';

  export default {
    name: 'royal-page-loading',

    components: {
      RLoading
    },

    data: () => ({
      progress: 0,
      loading: false,
      progressInterval: null,
      resetLineAnimation: false
    }),

    methods: {
      start () {
        const { dispatch } = this.$store;
        this.loading = true;
        // dispatch('ui/setPageLoading', true);
        this.startProgressChange();
      },

      finish () {
        const { dispatch } = this.$store;
        this.stopProgressChange();
        this.progress = 100;

        setTimeout(_ => {
          this.loading = false;
          // dispatch('ui/setPageLoading', false);
        }, 100);
      },

      startProgressChange () {
        if (this.progressInterval) {
          this.clearProgressInterval();
        }
        if (this.progress > 0) {
          this.resetLineAnimation = true;
        }

        this.$nextTick(() => {
          this.progress = 0;
          const maxProgressValue = 60;
          this.progressInterval = setInterval(_ => {
            this.resetLineAnimation && (this.resetLineAnimation = false);
            this.progress += (maxProgressValue - this.progress) / 10;
          }, 100);
        });
      },

      stopProgressChange () {
        this.clearProgressInterval();
      },

      clearProgressInterval () {
        clearInterval(this.progressInterval);
        this.progressInterval = null;
      }
    },

    computed: {
      classes () {
        return {
          'page-loading': true,
          'page-loading_reset-line-animation': this.resetLineAnimation
        };
      }
    }
  };
</script>

<template>
  <transition name="loading" mode="out-in">
    <div :class="classes" v-show="loading">
      <r-loading :lineHeight="2"
                 :progress="progress"
                 lineRound
                 lineShadow></r-loading>
    </div>
  </transition>
</template>

<style lang="scss">
  @import "../styles/components/_page-loading";
</style>
