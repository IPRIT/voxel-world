const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

const resolve = file => require('path').resolve(__dirname, file);

module.exports = {
  resolve: {
    extensions: ['*', '.js', '.json', '.vue', '.scss'],
    alias: {
      '~components': resolve('../src/components'),
      '~directives': resolve('../src/directives'),
      '~mixins': resolve('../src/mixins'),
      '~util': resolve('../src/util'),
      'styles': resolve('../src/styles')
    }
  },
  node: {
    fs: 'empty'
  },
  plugins: [
    new FriendlyErrorsWebpackPlugin({
      clearConsole: true
    }),
    new ProgressBarPlugin()
  ]
};
