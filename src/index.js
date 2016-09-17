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
  y: 'avgPerSecond'
})

const stats = new Stats({
  selector: '.chart-stats .chart',
  transition: 1000,
  x: ['avgPerSecond', 'avgPer60Seconds', 'avgPer600Seconds']
})

const bubbles = new Bubbles({
  selector: '.chart-related .chart',
  transition: 1000
})

const ws = new window.WebSocket(`ws${window.location.protocol === 'https:' ? 's' : ''}://${window.location.host}`)

ws.onmessage = (e) => {
  const { type, data } = JSON.parse(e.data)

  switch (type) {
    case 'snapshot':
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
