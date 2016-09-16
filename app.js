'use strict'

const _ = require('lodash')
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
  const compiler = webpack(require('./webpack.config'))
  app.use(require('connect-history-api-fallback')({ verbose: false }))
  app.use(require('webpack-dev-middleware')(compiler, { quiet: true, noInfo: true }))
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
wss.on('connection', (ws) => send({ type: 'snapshot', data: snapshot })(ws))

/*
 * Configure topics and snapshot to store rolling data window
 *
 */
const ROLLING_WINDOW = 30 * 60
const topics = [
  { topic: 'news-aggregate', offset: ROLLING_WINDOW },
  { topic: 'music-aggregate', offset: ROLLING_WINDOW },
  { topic: 'news-relatedwords' },
  { topic: 'music-relatedwords' }
]
const snapshot = _.transform(topics, (res, topic) => { res[topic.topic] = null }, {})

/*
 * Configure Kafka consumer
 *
 */
const consumer = new Kafka.SimpleConsumer({
  idleTimeout: 100,
  connectionString: process.env.KAFKA_URL.replace(/\+ssl/g, ''),
  ssl: {
    certFile: './client.crt',
    keyFile: './client.key'
  }
})

const subscribe = (topic, options = {}) => consumer.subscribe(topic, options, (messageSet, topic) => {
  const [name, type] = topic.split('-')
  const messages = messageSet.map((m) => JSON.parse(m.message.value.toString('utf8')))
  const hasOffset = !!options.offset
  const existing = snapshot[topic]

  if (existing === null) {
    if (hasOffset) {
      snapshot[topic] = messages.slice(messages.length > ROLLING_WINDOW ? messages.length - ROLLING_WINDOW : 0)
    } else {
      snapshot[topic] = _.last(messages)
    }
  } else {
    if (hasOffset) {
      if (existing.length + messages.length >= ROLLING_WINDOW) {
        snapshot[topic] = [...snapshot[topic].slice(existing.length + messages.length - ROLLING_WINDOW), ...messages]
      } else {
        snapshot[topic].push(messages)
      }
      messages.forEach((message) => broadcast({ name, type, data: message }))
    } else {
      const latest = _.last(messages)
      snapshot[topic] = latest
      broadcast({ name, type, data: latest })
    }
  }
})

consumer.init().then(() => {
  topics.forEach((topic) => {
    if (topic.offset) {
      consumer.offset(topic.topic).then((offset) => subscribe(topic.topic, { offset: offset - topic.offset }))
    } else {
      subscribe(topic.topic)
    }
  })
})
