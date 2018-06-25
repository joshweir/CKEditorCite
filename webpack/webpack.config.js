/*
 * process.env.NODE_ENV - used to determine whether we generate a production or development bundle
 */

const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackShellPlugin = require('webpack-shell-plugin');
const PATHS = require('./paths');
const rules = require('./rules');
const plugins = require('./plugins');
const externals = require('./externals');
const resolve = require('./resolve');

const isProduction = process.env.NODE_ENV === 'production'
const node = { __dirname: true, __filename: true };
// const hotMiddlewareScript = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true';
/*
const removeMe = () => {

  const prodBrowserRender = {
    devtool: 'cheap-module-source-map',
    entry: {
      'cite': ['../src/plugin'],
      'cite/dialogs': ['../src/plugin']
    },
    node,
    output: {
      path: '../',
      filename: '[name].js'
    },
    module: { rules: rules({ production: true, browser: true }) },
    resolve,
    plugins: plugins({ production: true, browser: true })
  };

  const devBrowserRender = {
    devtool: 'eval',
    context: PATHS.app,
    entry: { app: ['./client', hotMiddlewareScript] },
    node,
    output: {
      path: PATHS.assets,
      filename: '[name].js',
      publicPath: PATHS.public
    },
    module: { rules: rules({ production: false, browser: true }) },
    resolve,
    plugins: plugins({ production: false, browser: true })
  };

  const prodConfig = prodBrowserRender;
  const devConfig = devBrowserRender;
  const configuration = isProduction ? prodConfig : devConfig;

  return configuration;
};
*/

const config = {
    node,
    resolve,
    module: { rules: rules({ production: isProduction, browser: true }) },
    resolve,
    plugins: plugins({ production: isProduction, browser: true })
};
const commonDevConfig = {
  devtool: 'eval'
};
const commonProdConfig = {
  devtool: 'cheap-module-source-map'
};

const pluginProdConfig = Object.assign({}, commonProdConfig);
const pluginDevConfig = Object.assign({}, commonDevConfig, {
  entry: ['./plugin']
});
const citeDialogProdConfig = Object.assign({}, commonProdConfig);
const citeDialogDevConfig = Object.assign({}, commonDevConfig, {
  entry: ['./cite']
});
const intextCiteDialogProdConfig = Object.assign({}, commonProdConfig);
const intextCiteDialogDevConfig = Object.assign({}, commonDevConfig, {
  entry: ['./intext_cite']
});

const pluginEnvConfig = isProduction ? pluginProdConfig : pluginDevConfig;
const citeDialogEnvConfig = isProduction ? citeDialogProdConfig : citeDialogDevConfig;
const intextCiteDialogEnvConfig = isProduction ? intextCiteDialogProdConfig : intextCiteDialogDevConfig;

const citeDialogConfig = Object.assign({}, config, {
    name: 'citeDialog',
    context: PATHS.srcdialogs,
    entry: './cite',
    output: {
       path: PATHS.dialogs,
       filename: 'cite.js'
    },
}, citeDialogEnvConfig);

const intextCiteDialogConfig = Object.assign({}, config, {
    name: 'intextCiteDialog',
    context: PATHS.srcdialogs,
    entry: './intext_cite',
    output: {
       path: PATHS.dialogs,
       filename: 'intext_cite.js'
    },
}, intextCiteDialogEnvConfig);

const pluginConfig = Object.assign({}, config, {
    name: 'plugin',
    context: PATHS.src,
    entry: './plugin',
    output: {
       path: PATHS.app,
       filename: 'plugin.js'
    },
}, pluginEnvConfig, {
  plugins: plugins({ production: isProduction, browser: true })
    .concat(
      new CopyWebpackPlugin([
          {from: 'icons', to: 'icons'}
      ]),
      new WebpackShellPlugin({
        onBuildExit: [
          'echo "Transfering files to demo... "',
          'rm -rf demo/ckeditor/plugins/cite/',
          'mkdir -p demo/ckeditor/plugins/cite',
          'cp -r cite/ demo/ckeditor/plugins/cite/',
          'echo "DONE ... "',
        ],
      })
    )
});

module.exports = (env, argv) => {
  console.log(`Running webpack in ${process.env.NODE_ENV} mode ${argv.mode}`);
  return [
    citeDialogConfig, intextCiteDialogConfig, pluginConfig
  ];
};
