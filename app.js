'use strict'

const path = require('path')
const server = require('http').createServer()
const WebSocketServer = require('ws').Server
const express = require('express')
const webpack = require('webpack')
const Consumer = require('./consumer')
const app = express()

/*
 * Configure web app and webpack pieces
 *
 */
app.use(express.static(path.join(__dirname, 'dist')))

if (process.env.NODE_ENV !== 'production') {
  const compiler = webpack(require('./webpack.config'))
  app.use(require('connect-history-api-fallback')({ verbose: false }))
  app.use(require('webpack-dev-middleware')(compiler, {}))
} else {
  app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'dist/index.html')))
  app.get('/heroku', (req, res) => res.sendFile(path.join(__dirname, 'dist/index.html')))
  app.get('/salesforce', (req, res) => res.sendFile(path.join(__dirname, 'dist/salesforce.html')))
}

const port = process.env.PORT || 3000
server.on('request', app)
server.listen(port, () => console.log(`http/ws server listening on ${port}`))

/*
 * Configure WebSocketServer
 *
 */
const wss = new WebSocketServer({ server: server })

/*
 * Dummy interval to send data to client
 * To be replaced by actual kafka consumer
 *
 */
const consumer = new Consumer()
wss.on('connection', (ws) => ws.send(JSON.stringify(consumer.snapshot())))
// consumer.on('data', (data) => wss.clients.forEach((client) => client.send(JSON.stringify(data))))
consumer.start()
