'use strict'

import '../styles/style.css'
import Bar from './lib/bar'
import Stream from './lib/stream'
import Stats from './lib/stats'
import Bubbles from './lib/bubbles'
import Nav from './lib/nav'
import { MAX_SIZE, INTERVAL } from '../consumer/constants'

const bar = new Bar({
  selector: '.chart-topics .chart',
  transition: INTERVAL,
  x: 'id',
  y: 'count'
})

const stream = new Stream({
  selector: '.chart-stream .chart',
  transition: INTERVAL,
  x: 'time',
  y: 'avgPerSecond',
  maxSize: MAX_SIZE
})

const stats = new Stats({
  selector: '.chart-stats .chart',
  transition: INTERVAL,
  x: ['avgPerSecond', 'avgPer60Seconds', 'avgPer600Seconds'],
  titles: ['per second', 'per minute', 'per hour']
})

const bubbles = new Bubbles({
  selector: '.chart-related .chart',
  transition: INTERVAL,
  maxRelations: 20
})

const nav = new Nav({
  legend: '.footer-legend ul',
  architecture: '.architecture-link'
})

const url = `ws${window.location.href.match(/^http(s?:\/\/.*)\/.*$/)[1]}`
const ws = new window.WebSocket(url)

ws.onmessage = (e) => {
  const { type, data } = JSON.parse(e.data)

  switch (type) {
    case 'snapshot':
      nav.topics(Object.keys(data.aggregate))
      bar.init(data.aggregate)
      stream.init(data.aggregate)
      stats.init(data.aggregate)
      bubbles.init(data.relatedwords)
      break

    case 'aggregate':
      bar.update(data)
      stream.update(data)
      stats.update(data)
      break

    case 'relatedwords':
      bubbles.update(data)
      break
  }
}
