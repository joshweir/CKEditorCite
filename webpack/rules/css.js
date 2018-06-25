const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const PATHS = require('../paths');

module.exports = ({ production = false, browser = false } = {}) => {
  return {
    test: /\.css$/i,
    use: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: [
        {
          loader: 'css-loader',
          options: {
            minimize: production,
            autoprefixer: false,
            sourceMap: true,
            importLoaders: 1
          }
        },
        {
          loader: 'postcss-loader',
          options: {
            ident: 'postcss',
            plugins: () => [ require('autoprefixer')() ]
          }
       }
      ]
    }),
    include: PATHS.srcstyles
  };
};
