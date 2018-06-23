const path = require('path');

/*
 * __dirname is changed after webpack-ed to another directory
 * so process.cwd() is used instead to determine the correct base directory
 * Read more: https://nodejs.org/api/process.html#process_process_cwd
 */
const CURRENT_WORKING_DIR = process.cwd();

module.exports = {
  src: path.resolve(CURRENT_WORKING_DIR, 'src'),
  srcdialogs: path.resolve(CURRENT_WORKING_DIR, 'src', 'dialogs'),
  srcicons: path.resolve(CURRENT_WORKING_DIR, 'src', 'icons'),
  srcstyles: path.resolve(CURRENT_WORKING_DIR, 'src', 'styles'),
  icons: path.resolve(CURRENT_WORKING_DIR, 'cite', 'icons'),
  app: path.resolve(CURRENT_WORKING_DIR, 'cite'),
  dialogs: path.resolve(CURRENT_WORKING_DIR, 'cite', 'dialogs'),
  styles: path.resolve(CURRENT_WORKING_DIR, 'cite', 'styles'),
  demo: path.resolve(CURRENT_WORKING_DIR, 'demo'),
  //public: '/assets/', // use absolute path for css-loader?
  modules: path.resolve(CURRENT_WORKING_DIR, 'node_modules')
  //vendor: path.resolve(CURRENT_WORKING_DIR, 'vendor')
};
