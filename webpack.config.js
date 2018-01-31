module.exports = {

  entry: './src/index.ts',
  
  target: 'web',
  
  output: {
        path: __dirname,
        filename: './lib/browser.js',
        libraryTarget: 'umd',
        library: 'ont' // This is the var name in browser
  },
  
  resolve: {
    extensions: ['.webpack.js', '.web.js', '.ts', '.js']
  },
  
  node: {
    fs: 'empty',
    'child_process': 'empty'
  },
  
  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts-loader' }
    ]
  }
  
}