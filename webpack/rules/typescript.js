const PATHS = require('../paths');

module.exports = ({ production = false, browser = false } = {}) => {
  return {
    test: /\.ts$/,
    loader: ['babel-loader', 'ts-loader'],
    exclude: PATHS.modules
  };
};
