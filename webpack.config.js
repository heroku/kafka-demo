'use strict'

const path = require('path')
const HtmlPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const LiveReloadPlugin = require('webpack-livereload-plugin')
const CleanPlugin = require('clean-webpack-plugin')
const precss = require('precss')
const autoprefixer = require('autoprefixer')
const postcssImport = require('postcss-import')

const production = process.env.NODE_ENV === 'production'
const theme = process.env.SALESFORCE_THEME === 'true' ? 'salesforce' : 'heroku'

const html = (filename, bodyClass) => new HtmlPlugin({
  production,
  filename,
  bodyClass,
  inject: false,
  template: path.join(__dirname, 'views', 'index.pug')
})

module.exports = {
  entry: path.join(__dirname, 'src', 'index.js'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: `app${production ? '.[hash]' : ''}.js`
  },
  module: {
    loaders: [
      {
        test: /.js$/,
        loader: 'babel',
        exclude: /node_modules/
      },
      {
        test: /.json$/,
        loader: 'json'
      },
      {
        test: /.pug$/,
        loader: 'pug'
      },
      {
        test: /\.css$/,
        loader: production ? ExtractTextPlugin.extract('style', 'css!postcss') : 'style!css!postcss'
      }
    ]
  },
  postcss: (webpack) => [
    postcssImport({ addDependencyTo: webpack }),
    precss,
    autoprefixer
  ],
  plugins: [
    html('index.html', theme),
    new CleanPlugin(['dist'], { root: __dirname, verbose: false }),
    production && new ExtractTextPlugin('app.[contenthash].css'),
    !production && new LiveReloadPlugin()
  ].filter(Boolean)
}
