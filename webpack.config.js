const path = require('path');

module.exports = {
  /*mode: 'development',*/
  entry: './src/index.ts',
  output: {
    filename: 'plugin.js',
    path: path.resolve(__dirname, 'cite')
  }
};
