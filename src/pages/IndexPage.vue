<script>
  export default {
    name: 'index-page',

    transition: {
      name: 'page',
      mode: 'out-in'
    },

    components: {
      RoyalStartMenu: () => import(/* webpackChunkName: "pages/index-page" */ '../components/RoyalStartMenu')
    },

    data: () => ({})
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
