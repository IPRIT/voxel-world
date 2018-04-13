const gamePackage = require('../package.json');

module.exports = {
  'process.env.GAME_VERSION': gamePackage.version
};
