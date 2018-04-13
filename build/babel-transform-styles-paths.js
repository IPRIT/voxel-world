const types = require('babel-types');
const pathLib = require('path');
const wrapListener = require('babel-plugin-detective/wrap-listener');

module.exports = wrapListener(listener, 'transform-styles-paths');

function listener (path, file, opts) {
  const regex = /((?:\.\.\/)+)/gi;
  if (path.isLiteral() && path.node.value.endsWith('.scss')) {
    const matches = regex.exec(path.node.value);
    if (!matches) return;

    path.node.value = path.node.value.replace(matches[0], `${matches[0]}../src/`);
  }
}
