// For instructions about this file refer to
// webpack and webpack-hot-middleware documentation
var webpack = require('webpack');
var path = require('path');

module.exports = {
  debug: true,
  devtool: '#eval-source-map',

  entry: [
    './src/main.ts'
  ],

  output: {
    path: path.join(__dirname, 'app'),
    publicPath: '/',
    filename: 'dist/bundle.js'
  },

  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  
  resolve: {
    extensions: ['', '.ts', '.js']
  },

  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts-loader' },
    ],
  }
};
