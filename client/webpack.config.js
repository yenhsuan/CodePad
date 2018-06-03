const webpack = require('webpack')
const path = require('path')
const HTMLPlugin = require('html-webpack-plugin')

module.exports = {
  entry: [
    'react-hot-loader/patch',
    path.join(__dirname, './src/index.js'),
  ],
  output: {
    filename: 'bundle.[hash].js',
    path: path.join(__dirname, '../dist'),
    publicPath: '/',
  },
  resolve: {
    extensions: ['*', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(jsx)$/,
        loader: 'babel-loader',
        exclude: [
          path.join(__dirname, './node_modules'),
        ],
      },
      {
        test: /\.(js)$/,
        loader: 'babel-loader',
        exclude: [
          path.join(__dirname, './node_modules'),
        ],
      },
      {
        test: /\.(js|jsx)$/,
        loader: 'eslint-loader',
        exclude: [
          path.join(__dirname, './node_modules'),
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.jpe?g$|\.ico$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$|\.wav$|\.mp3$/,
        loader: 'file-loader?name=[name].[ext]',
      },
    ],
  },
  plugins: [
    new HTMLPlugin({
      template: path.join(__dirname, './index.html'),
      favicon: path.join(__dirname, './favicon.ico'),
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
  devServer: {
    host: '0.0.0.0',
    port: '3000',
    contentBase: path.join(__dirname, './dist'),
    overlay: {
      errors: true,
    },
    publicPath: '/',
    historyApiFallback: true,
    hot: true,
  },
}
