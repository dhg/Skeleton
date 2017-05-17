const webpack = require('webpack');
const common  = require('./webpack.common.config');

/**
 * Add the uglify plugin for production builds
 */
common.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
        warnings: false
    },
    mangle: true
}));

/**
 * Swap React for react-lite in production
 */
common.resolve = {
    alias: {
        'react': 'react-lite',
        'react-dom': 'react-lite'
    }
};

module.exports = common;
