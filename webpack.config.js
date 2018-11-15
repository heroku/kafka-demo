const path = require('path')
const webpack = require('webpack')
const HtmlPlugin = require('html-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const CleanPlugin = require('clean-webpack-plugin')
const LiveReloadPlugin = require('webpack-livereload-plugin')

const production = process.env.NODE_ENV === 'production'
const theme = process.env.SALESFORCE_THEME === 'true' ? 'salesforce' : 'heroku'

module.exports = {
  mode: production ? 'production' : 'development',
  entry: path.join(__dirname, 'src', 'index.js'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: `app${production ? '.[hash]' : ''}.js`
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
          production
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
        cache: true,
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
      production,
      minify: production ? { collapseWhitespace: true } : false,
      filename: 'index.html',
      bodyClass: theme,
      title: 'Kafka Demo App',
      inject: false,
      template: path.join(__dirname, 'views', 'index.pug')
    }),
    new CleanPlugin(['dist'], { root: __dirname, verbose: false }),
    new webpack.DefinePlugin({
      'process.env.TWITTER_TRACK_TERMS': JSON.stringify(
        process.env.TWITTER_TRACK_TERMS
      )
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    }),
    !production && new LiveReloadPlugin({ quiet: true })
  ].filter(Boolean)
}
