const fs = require('fs');
const { config } = require('./config');

const isProduction = process.env.NODE_ENV === 'production' || false;
const isDevelopment = process.env.NODE_ENV === 'development' || false;
const isStaging = process.env.NODE_ENV === 'staging' || false;
const isTest = process.env.NODE_ENV === 'test' || false;

const productionModules = [
  /**
   * PWA plugin
   * @link https://github.com/nuxt-community/pwa-module
   */
  '@nuxtjs/pwa'
];

module.exports = {
  srcDir: 'src/',
  /**
   * SPA routes
   */
  /* generate: {
    routes: [
      '/'
    ]
  },*/
  router: {
    // Run the middleware/*.js on every pages
    // middleware: ['test']
  },
  modules: [
    ...(isProduction ? productionModules : []),
    /**
     * Router module
     * @link https://github.com/nuxt-community/router-module
     */
    '@nuxtjs/router',
    /**
     * Axios crossplatform module
     * @link https://github.com/nuxt-community/axios-module
     */
    '@nuxtjs/axios',
    /**
     * Component caching
     * @link https://nuxtjs.org/faq/cached-components#how-to-cache-vue-components-
     */
    ['@nuxtjs/component-cache', {
      max: 100,
      maxAge: 1000 // microcaching https://ssr.vuejs.org/en/caching.html
    }],
    /**
     * display webpack build progress
     * @link https://github.com/nuxt-community/webpack-profile-module
     */
    '@nuxtjs/webpack-profile'
  ],
  /**
   * PWA Manifest
   */
  manifest: {
    name: 'Voxel Royal',
    description: 'Voxel Royal — The best browser MMO in royal genre',
    keywords: 'voxel,royal battle,browser,королевская битва,браузер,minecraft online,mmo games',
    lang: 'en',
    'background_color': '#fafafa',
    'theme_color': '#f44292'
  },
  /**
   * Axios default settings
   * @link https://github.com/nuxt-community/axios-module
   */
  axios: {
  },
  /**
   * Headers of the page
   * @link https://nuxtjs.org/guide/views#html-head
   */
  head: {
    title: 'Voxel Royal™',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'The Most Delightful Battle Royal in your browser' },
      { hid: 'keywords', name: 'keywords', content: 'voxel,royal battle,browser,королевская битва,браузер,minecraft online,mmo games' },
      { name: 'google-signin-scope', content: 'profile email' },
      { name: 'google-signin-client_id', content: config.google.clientId }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', type: 'text/css', href: 'https://fonts.googleapis.com/css?family=Comfortaa:300,400,700|Yanone+Kaffeesatz:300,400,700&amp;subset=cyrillic' }
    ]
  },
  /*
  ** Customize the progress bar color
  */
  loading: 'components/RoyalPageLoading.vue',
  /**
   * Global CSS
   * @link https://nuxtjs.org/examples/global-css#__nuxt
   */
  css: [
  ],
  /**
   * Vue plugins
   * Project directory: ~/plugins
   * @link https://nuxtjs.org/guide/plugins#__nuxt
   */
  plugins: [
    '~/plugins/vuex-router-sync',
    '~/plugins/axios'
  ],
  /*
  ** Build configuration
  */
  build: {
    /**
     * Add modules inside the vendor.bundle.js
     * to reduce the size of the application bundle
     */
    vendor: [
      // Polyfills
      'babel-polyfill',
      // Polyfill for IE Support
      'event-source-polyfill',
      // Modules
      'axios'
    ],
    /**
     * PostCSS plugins
     */
    postcss: [
    ],
    /**
     * Override chunks naming
     * p.s. vendor files exports to `common.[chunkhash].js
     * @link https://nuxtjs.org/api/configuration-build#filenames
     */
    filenames: {
    },
    /*
    ** Run ESLint on save
    */
    extend (config, ctx) {
      overrideWebpackConfig( config, ctx );
    }
  }
};

function overrideWebpackConfig (config, ctx) {
  if (ctx.isDev && ctx.isClient) {
    config.module.rules.push({
      enforce: 'pre',
      test: /\.(js|vue)$/,
      loader: 'eslint-loader',
      exclude: /node_modules/
    });
  }

  if (ctx.isDev) {
    const vueLoader = config.module.rules.find(rule => {
      return rule.loader === 'vue-loader';
    });
    const cssLoader = vueLoader.options.loaders.scss.find(item => {
      return item.loader === 'css-loader';
    });
    cssLoader.options.minimize = true;
  }

  config.module.rules.push({
    test: /\.worker\.js$/,
    use: [
      'babel-loader',
      {
        loader: 'worker-loader',
        options: {
        }
      }
    ]
  });

  const urlImageLoader = config.module.rules.find(rule => {
    return rule.loader === 'url-loader' && rule.options.name.startsWith('img');
  });
  // increase size of base64 image
  urlImageLoader.options.limit = 2000;

  const babelLoader = config.module.rules.find(item => {
    return item.loader === 'babel-loader';
  });
  babelLoader.options.plugins = [
    ["transform-class-properties"]
  ];

  const definitionPlugin = (config.plugins || []).find(plugin => {
    return plugin && plugin.hasOwnProperty('definitions');
  });

  if (definitionPlugin) {
    const definitions = definitionPlugin.definitions;
    // definitions['process.apiHost'] = `"${apiHost}"`;
  }
  return config;
}

/**
 * @param {*} config
 */
function debugWebpackConfig (config) {
  if (true || !isProduction) {
    const filePath = `./webpack.${ isProduction ? '' : 'development.' }config.json`;
    try {
      fs.unlinkSync(filePath);
    } catch (err) {}
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
  }
}
