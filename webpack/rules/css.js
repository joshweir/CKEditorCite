const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const PATHS = require('../paths');

module.exports = ({ production = false, browser = false } = {}) => {
  return {
    test: /\.css$/i,
    use: ExtractTextPlugin.extract({
      use: {
        loader: 'css-loader',
        options: {
          minimize: production
        }
      }
    }),
    include: PATHS.srcstyles
  };
};
