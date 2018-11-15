const path = require('path')
const webpack = require('webpack')
const HtmlPlugin = require('html-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const CleanPlugin = require('clean-webpack-plugin')
const LiveReloadPlugin = require('webpack-livereload-plugin')

const { NODE_ENV, SALESFORCE_THEME, TWITTER_TRACK_TERMS } = process.env
const PRODUCTION = NODE_ENV === 'production'
const THEME = SALESFORCE_THEME === 'true' ? 'salesforce' : 'heroku'

module.exports = {
  devtool: PRODUCTION ? 'source-map' : 'cheap-module-source-map',
  mode: PRODUCTION ? 'production' : 'development',
  entry: path.join(__dirname, 'src', 'index.js'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: `app${PRODUCTION ? '.[hash]' : ''}.js`
  },
  stats: 'minimal',
  module: {
    rules: [
      {
        test: /.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              plugins: ['lodash'],
              presets: ['@babel/preset-env']
            }
          }
        ]
      },
      {
        test: /.pug$/,
        use: ['pug-loader']
      },
      {
        test: /\.css$/,
        use: [
          PRODUCTION
            ? {
                loader: MiniCssExtractPlugin.loader
              }
            : 'style-loader',
          { loader: 'css-loader', options: { importLoaders: 1 } },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: (loader) => [
                require('postcss-import')({ root: loader.resourcePath }),
                require('postcss-preset-env')(),
                require('precss')()
              ]
            }
          }
        ]
      }
    ]
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        parallel: true,
        sourceMap: true,
        uglifyOptions: {
          output: {
            comments: false
          }
        }
      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  plugins: [
    new HtmlPlugin({
      production: PRODUCTION,
      minify: PRODUCTION ? { collapseWhitespace: true } : false,
      filename: 'index.html',
      bodyClass: THEME,
      title: 'Kafka Demo App',
      inject: false,
      template: path.join(__dirname, 'views', 'index.pug')
    }),
    new CleanPlugin(['dist'], { root: __dirname, verbose: false }),
    new webpack.DefinePlugin({
      'process.env.TWITTER_TRACK_TERMS': JSON.stringify(TWITTER_TRACK_TERMS)
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    }),
    !PRODUCTION && new LiveReloadPlugin({ quiet: true })
  ].filter(Boolean)
}
