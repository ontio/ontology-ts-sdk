const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

require('babel-polyfill')

let common = {
  entry: ['babel-polyfill','./src/index.ts'],
  resolve : {
    extensions : ['.ts', '.js']
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader'
        }
      },
      { test: /\.ts$/, loader: 'ts-loader' }
    ]
  },
  node: {
    fs: 'empty',
    'child_process': 'empty'
  },
  plugins: [
    new CleanWebpackPlugin(['lib/*.js', 'lib/*.js.map'])
  ]
}

module.exports = function (env) {
  if (env && env.prod) {
    common.plugins = common.plugins.concat([
      new UglifyJSPlugin({
        parallel: true,
        sourceMap: true
      }),
    
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify('production')
        }
      })
    ])
  } else {
    common.devtool = 'source-map'
  }
  return [
    Object.assign({}, common, {
      target: 'web',
      output: {
        path: __dirname,
        filename: './lib/browser.js',
        libraryTarget: 'umd',
        library: 'Ont' // This is the var name in browser
      }
    }),
    Object.assign({}, common, {
      target: 'node',
      output: {
        path: __dirname,
        filename: './lib/index.js',
        libraryTarget: 'umd',
      }
    })
  ]
}
