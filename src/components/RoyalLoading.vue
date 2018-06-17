<script>
  export default {
    name: 'royal-loading',

    props: {
      disabled: Boolean,
      line: {
        type: Boolean,
        default: true
      },
      lineHeight: {
        type: Number,
        default: 3
      },
      progress: {
        type: Number,
        default: 0
      },
      lineColor: {
        type: String,
        default: 'primary'
      },
      lineBackground: {
        type: String,
        default: 'transparent'
      },
      lineRound: Boolean,
      lineShadow: Boolean
    },

    computed: {
      classes () {
        return {
          'loading': true,
          'loading_disabled': this.disabled,
          'loading_line': this.line,
          'loading_round-line': this.lineRound,
          'loading_shadow-line': this.lineShadow
        };
      }
    },

    render (h) {
      const data = {
        class: this.classes
      };
      const children = [];

      data.style = {
        background: this.lineBackground,
        height: `${this.lineHeight}px`
      };
      children.push(
        h('div', {
          staticClass: 'loading__line',
          class: {
            [this.lineColor]: true
          },
          style: {
            width: `${this.progress}%`
          }
        })
      );

      return h('div', data, children);
    }
  };
</script>

<style lang="scss">
  @import "../styles/components/_loading.scss";
</style>
