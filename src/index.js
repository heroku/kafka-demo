'use strict'

import '../styles/style.css'
import Bar from './charts/bar'
import Stream from './charts/stream'
import Stats from './charts/stats'
import Bubbles from './charts/bubbles'

const bar = new Bar({
  selector: '.chart-topics .chart',
  transition: 1000,
  x: 'id',
  y: 'count'
})

const stream = new Stream({
  selector: '.chart-stream .chart',
  transition: 1000,
  x: 'time',
  y: 'avg'
})

const stats = new Stats({
  selector: '.chart-stats .chart',
  transition: 1000,
  x: ['avg', 'avg60', 'avg600']
})

const bubbles = new Bubbles({
  selector: '.chart-related .chart',
  transition: 1000
})

const ws = new window.WebSocket(`ws://${window.location.host}`)

let topics = []

const topicQueue = (update) => {
  let obj = {}
  return (data) => {
    obj[data.id] = data
    if (Object.keys(obj).length === topics.length) {
      update.forEach((u) => u.update(obj))
      obj = {}
    }
  }
}

const updateMetrics = topicQueue([bar, stream, stats])
const updateRelated = topicQueue([bubbles])

ws.onmessage = (e) => {
  const { type, data } = JSON.parse(e.data)

  switch (type) {
    case 'snapshot':
      topics = data.topics
      bar.init(data.metrics)
      stream.init(data.metrics)
      stats.init(data.metrics)
      bubbles.init(data.related)
      break

    case 'metrics':
      updateMetrics(data)
      break

    case 'related':
      updateRelated(data)
      break

    case 'config':
      topics = data
  }
}
