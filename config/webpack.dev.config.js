/* eslint-disable */
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlwebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
module.exports = {
  entry:{
    index:["babel-polyfill",'./src/pages/index/index.js'], 
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(process.cwd(), 'dist')
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
      {
      test: /\.(less|css)$/,
      // use: [{
      //     loader: "style-loader" // creates style nodes from JS strings
      // }, {
      //     loader: "css-loader" // translates CSS into CommonJS
      // }, {
      //     loader: "less-loader" // compiles Less to CSS
      // }
      // ]
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        //resolve-url-loader may be chained before sass-loader if necessary 
        use: ['css-loader', 'less-loader']
      })
    },
    {
      test: /\.(png|jpg|gif)$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]',
            // publicPath: 'dist/'
          }  
        }
      ]
    },
    { test: /\.tpl$/, loader: "dot-tpl-loader?append=true" },
    { test: /\.(woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' }
  ]
  },
  plugins:[
    new CleanWebpackPlugin(['dist'],{
      root: process.cwd()
    }),
    new ExtractTextPlugin('style.css'),
    new HtmlwebpackPlugin({
      inject:true,
      template: './index.html',
      // hash: true
    }),
    new CopyWebpackPlugin([
      {from: 'config/webim.config.js'},
      {from: 'src/libs/strophe-1.2.8.min.js'},
      {from: 'src/libs/websdk-1.4.8.js'},
    ])
  ],
  resolve: {
    extensions: ['.json', '.js', '.jsx', '.css']
  },
  devtool: 'source-map',
  devServer: {
    contentBase: './dist',
    host: "0.0.0.0",
  }
};