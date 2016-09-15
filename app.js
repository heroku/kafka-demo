'use strict'

const path = require('path')
const server = require('http').createServer()
const WebSocketServer = require('ws').Server
const express = require('express')
const webpack = require('webpack')
const Kafka = require('no-kafka')
const app = express()

/*
 * Configure web app and webpack pieces
 *
 */
app.use(express.static(path.join(__dirname, 'dist')))

if (process.env.NODE_ENV !== 'production') {
  app.use(require('connect-history-api-fallback')({ verbose: false }))
  app.use(require('webpack-dev-middleware')(webpack(require('./webpack.config'))))
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
const send = (data) => (client) => client.send(JSON.stringify(data))
const broadcast = (data) => wss.clients.forEach(send(data))

/*
 * Configure Kafka consumer
 *
 */
const topics = ['news-aggregate', 'music-aggregate', 'news-relatedwords', 'music-relatedwords']

const consumer = new Kafka.SimpleConsumer({
  idleTimeout: 100,
  clientId: 'simple-consumer',
  connectionString: process.env.KAFKA_URL.replace(/\+ssl/g, ''),
  ssl: {
    certFile: './client.crt',
    keyFile: './client.key'
  }
})

/*
 * Init Kafka consumer and data handler
 *
 */
const dataHandler = (subscription) => (messageSet) => messageSet.forEach((m) => {
  const data = JSON.parse(m.message.value.toString('utf8'))
  const [topic, type] = subscription.split('-')
  broadcast({ topic, type, data })
})

const subscribe = (topic) => consumer.subscribe(topic, [0], dataHandler(topic))

consumer.init().then(() => Promise.all(topics.map(subscribe)))
