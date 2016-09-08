'use strict'

const path = require('path')
const HtmlPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const precss = require('precss')
const autoprefixer = require('autoprefixer')

const root = (...parts) => path.join(__dirname, ...parts)
const src = (...parts) => root('src', ...parts)
const production = process.env.NODE_ENV === 'production'
const dist = 'dist'

module.exports = {
  entry: src('index.js'),
  output: {
    path: root(dist),
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
  postcss: () => [precss, autoprefixer],
  plugins: [
    new HtmlPlugin({
      production,
      inject: false,
      template: src('index.pug'),
      minify: {
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        collapseInlineTagWhitespace: true,
        conservativeCollapse: true,
        removeAttributeQuotes: true,
        removeComments: true,
        removeEmptyAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        quoteCharacter: "'"
      }
    }),
    production && new ExtractTextPlugin('app.[contenthash].css')
  ].filter(Boolean)
}
