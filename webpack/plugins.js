const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = ({ production = false, browser = false } = {}) => {
  const bannerOptions = { raw: true, banner: 'require("source-map-support").install();' };
  const compress = { warnings: false };
  const compileTimeConstantForMinification = { __PRODUCTION__: JSON.stringify(production) };
  const pluginsCommon = [
    new CleanWebpackPlugin('cite', {root: process.cwd()}),
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new webpack.DefinePlugin(compileTimeConstantForMinification),
    new ExtractTextPlugin({
      filename: 'styles/plugin.css'
    })
  ];

  if (!production && browser) {
    return pluginsCommon.concat(
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin()
    );
  }
  if (production && browser) {
    return pluginsCommon.concat(
      /*new webpack.optimize.UglifyJsPlugin({ compress }),*/
      new ManifestPlugin({
        fileName: 'manifest.json'
      })
    );
  }
  return [];
};
