// For instructions about this file refer to
// webpack and webpack-hot-middleware documentation
var webpack = require('webpack');
var path = require('path');
var CompressionPlugin = require("compression-webpack-plugin");

module.exports = {
    devtool: 'source-map',
    context: path.join(__dirname, 'app', 'js'),
    entry: [
        './main'
    ],
    output: {
        path: path.join(__dirname, 'app', 'dist'),
        filename: 'bundle.js'
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.NoErrorsPlugin(),
        new CompressionPlugin({
            asset: "[path].gz[query]",
            algorithm: "gzip",
            test: /\.js$/,
            threshold: 10240,
            minRatio: 0.8
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            mangle: true
        })
    ],
    resolve: {
        extensions: ['', '.jsx', '.js']
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loaders: ['babel']
            }
        ]
    }
};
