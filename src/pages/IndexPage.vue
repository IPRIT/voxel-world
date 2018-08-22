<script>
  import { createNamespacedHelpers } from 'vuex';

  const userStore = createNamespacedHelpers( 'user' );

  export default {
    name: 'index-page',

    transition: {
      name: 'page',
      mode: 'out-in'
    },

    components: {
      RoyalStartMenu: () => import(/* webpackChunkName: "pages/index-page" */ '../components/RoyalStartMenu')
    },

    data: () => ({}),

    async fetch ({ store }) {
      const { dispatch } = store;
      return dispatch( 'user/restoreSession' );
    },

    computed: {
      ...userStore.mapState({
        me: state => state.me
      })
    }
  };
</script>

<template>
  <div class="index-page">
    <RoyalStartMenu />
  </div>
</template>

<style lang="scss">
  @import "../styles/components/pages/index";
</style>
