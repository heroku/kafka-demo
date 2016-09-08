'use strict'

const path = require('path')
const server = require('http').createServer()
const WebSocketServer = require('ws').Server
const express = require('express')
const webpack = require('webpack')
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
}

const port = process.env.PORT || 3000
server.on('request', app)
server.listen(port, () => console.log(`http/ws server listening on ${port}`))

/*
 * Configure WebSocketServer
 *
 */
var wss = new WebSocketServer({ server: server })

wss.on('connection', (ws) => {
  ws.on('open', () => console.log('New WebSocket connection'))
  ws.on('close', () => console.log('WebSocket connection closed'))
})

/*
 * Send messages received from Kafka consumer out over WebSocket
 *
 */
const broadcastClient = (data) => (client) => client.send(data)
const broadcast = (data) => wss.clients.forEach(broadcastClient(data))

/*
 * Dummy interval to send data to client
 *
 */
setInterval(() => {
  broadcast('test')
}, 250)
