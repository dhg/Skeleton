const common  = require('./webpack.common.config');

common.debug = true;
common.devtool = '#eval-source-map';

module.exports = common;
