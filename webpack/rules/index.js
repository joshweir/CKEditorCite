const image = require('./image');
const javascript = require('./javascript');
const css = require('./css');
const typescript = require('./typescript');

module.exports = ({ production = false, browser = false } = {}) => (
  [
    typescript({ production, browser }),
    javascript({ production, browser }),
    css({ production, browser }),
    image()
  ]
);
