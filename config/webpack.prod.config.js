/* eslint-disable */
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const HtmlwebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
module.exports = {
  entry:{
    main:["babel-polyfill",'./src/components/index.js'],
    index:["babel-polyfill",'./src/pages/index/index.js'] 
  },
  output: {
    filename: '[name].bundle.[hash].js',
    path: path.resolve(process.cwd(), 'dist')
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
      {
        test: /\.(less|css)$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          //resolve-url-loader may be chained before sass-loader if necessary 
          use: [
            {loader:'css-loader',
              options: {
                minimize: true // 压缩css
              }
            }, 'less-loader']
        }),
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
    // 为以后外部im-pc 提供接口 im-common.js
    new  webpack.optimize.CommonsChunkPlugin({
      name: 'im-common',
      filename: 'im-common.js',
      chunks: ['main'],
    }),
    new CleanWebpackPlugin(['dist'], { root: process.cwd() }),
    // 输出单个的css文件,启用hash值
    new ExtractTextPlugin('style.[contenthash].css'),
    new UglifyJSPlugin(), // 压缩js
    new HtmlwebpackPlugin({
      inject:true,
      template: './index.html',
      chunks: ['index']
      // hash: true
    }),
    // 拷贝依赖文件
    new CopyWebpackPlugin([
      {from: 'config/webim.config.js'},
      {from: 'src/libs/strophe-1.2.8.min.js'},
      {from: 'src/libs/websdk-1.4.8.js'},
    ])
  ],
  resolve: {
    extensions: ['.json', '.js', '.jsx', '.css']
  }
};