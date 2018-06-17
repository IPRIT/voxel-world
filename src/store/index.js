// global store

// custom plugins
/*
  @see https://nuxtjs.org/guide/vuex-store#modules-mode
  import myPlugin from 'myPlugin';
  export const plugins = [ myPlugin ];
*/

// просто возвращаем функцию state, чтобы создать store в Nuxt
export const state = () => ({
});

export * from './_actions';
export * from './_mutations';
export * from './_getters';
