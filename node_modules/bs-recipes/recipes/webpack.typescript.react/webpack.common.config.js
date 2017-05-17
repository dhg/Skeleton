// For instructions about this file refer to
// webpack and webpack-hot-middleware documentation
var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: [
        './src/main.tsx'
    ],
    output: {
        path: path.join(__dirname, 'app'),
        publicPath: '/',
        filename: 'dist/bundle.js'
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.NoErrorsPlugin(),
    ],
    resolve: {
        extensions: ['', '.tsx', '.ts', '.js']
    },
    module: {
        loaders: [
            { test: /\.tsx$/, loader: 'ts-loader' }
        ]
    }
};
