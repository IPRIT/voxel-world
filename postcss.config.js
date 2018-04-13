const autoprefixer = require('autoprefixer');
const flexbugs = require('postcss-flexbugs-fixes');
const doiuse = require('doiuse');
const mqpacker = require('css-mqpacker');
const postcss = require('postcss');

const browsers = [
  'ie >= 11', 'safari >= 8', 'last 10 versions', '> 1%'
];

module.exports = (ctx) => ({
  plugins: [
    autoprefixer({
      browsers
    }),
    flexbugs(),
    /* doiuse({
      browsers,
      ignore: [], // an optional array of features to ignore
      ignoreFiles: ['**!/normalize.css'], // an optional array of file globs to match against original source file path, to ignore
      onFeatureUsage: function (usageInfo) {
        console.log(usageInfo.message);
      }
    }),*/
    mqpacker()
  ]
});
