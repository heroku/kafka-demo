'use strict'

import '../styles/style.css'
import Bar from './charts/bar'
import Stream from './charts/stream'

const bar = window.bar = new Bar({
  selector: '.chart-topics .chart',
  transition: 1000,
  x: 'id',
  y: 'count'
})

const stream = window.stream = new Stream({
  selector: '.chart-stream .chart',
  transition: 1000,
  x: 'time',
  y: 'avg'
})

const ws = new window.WebSocket(`ws://${window.location.host}`)

ws.onmessage = (e) => {
  const { type, data } = JSON.parse(e.data)

  if (type === 'snapshot') {
    bar.init(data.metrics)
    stream.init(data.metrics)
  } else if (type === 'metrics') {
    bar.update(data)
    stream.update(data)
  }
}
