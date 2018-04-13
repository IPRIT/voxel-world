const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.config');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

var extractPlugin = ExtractTextPlugin.extract({
  use: ['css-loader', 'postcss-loader', 'sass-loader']
});

// Helpers
const resolve = file => require('path').resolve(__dirname, file);

module.exports = merge(baseWebpackConfig, {
  devtool: '#source-map',
  entry: {
    app: './src/index.js'
  },
  output: {
    path: resolve('../dist'),
    publicPath: '/dist/',
    library: 'Rabotify'
  },
  module: {
    noParse: /es6-promise\.js$/, // avoid webpack shimming process
    rules: [
      {
        test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader',
            options: {
              loaders: {
                sass: extractPlugin
              }
            }
          },
          'eslint-loader'
        ],
        exclude: /node_modules\/(?!md-svg-vue)\/.*/
      },
      {
        test: /\.js$/,
        loaders: ['babel-loader', 'eslint-loader'],
        exclude: /node_modules\/(?!md-svg-vue)\/.*/
      },
      {
        test: /\.scss$/,
        use: extractPlugin,
        exclude: /node_modules/
      }
    ]
  },
  performance: {
    hints: false
  }
});
