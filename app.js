/* eslint no-console:0 */

const path = require('path')
const server = require('http').createServer()
const WebSocketServer = require('ws').Server
const express = require('express')
const webpack = require('webpack')
const Consumer = require('./consumer')
const app = express()
const constants = require('./consumer/constants')

/*
 * Configure web app and webpack pieces
 *
 */
app.use(express.static(path.join(__dirname, 'dist')))
app.use('/images', express.static(path.join(__dirname, 'images')))

if (process.env.NODE_ENV !== 'production') {
  const compiler = webpack(require('./webpack.config'))
  app.use(require('connect-history-api-fallback')({ verbose: false }))
  app.use(require('webpack-dev-middleware')(compiler, { stats: 'minimal' }))
} else {
  app.get('/', (req, res) =>
    res.sendFile(path.join(__dirname, 'dist/index.html'))
  )
}

const port = process.env.PORT || 3000
server.on('request', app)

/*
 * Configure WebSocketServer
 *
 */
const wss = new WebSocketServer({ server: server })
const send = (data) => (client) => client.send(JSON.stringify(data))

/*
 * Configure Kafka consumer
 *
 */
const consumer = new Consumer({
  broadcast: (data) => wss.clients.forEach(send(data)),
  topics: constants.TOPICS.map((name) => ({ name })),
  types: [
    { name: 'aggregate', maxSize: constants.MAX_BUFFER_SIZE },
    { name: 'relatedwords', maxSize: 1 }
  ],
  consumer: {
    connectionString: process.env.KAFKA_URL.replace(/\+ssl/g, ''),
    ssl: {
      certFile: path.resolve(__dirname, 'client.crt'),
      keyFile: path.resolve(__dirname, 'client.key')
    }
  }
})

consumer
  .init()
  .catch((err) => {
    console.error(`Consumer could not be initialized: ${err}`)
  })
  .then(() => {
    wss.on('connection', (client) => send(consumer.snapshot())(client))
    // eslint-disable-next-line no-console
    server.listen(port, () =>
      console.log(`http/ws server listening on http://localhost:${port}`)
    )
  })
