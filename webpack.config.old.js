const path = require('path');

module.exports = {
  entry: './src/plugin.ts',
  output: {
    filename: 'plugin.js',
    path: path.resolve(__dirname, 'cite')
  }
};
