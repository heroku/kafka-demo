'use strict'

import '../styles/style.css'
import _ from 'lodash'
import Bar from './charts/bar'

const bar = new Bar({
  selector: '.chart-topics .chart',
  transition: 250,
  x: 'id',
  y: 'count'
})

const ws = new window.WebSocket(`ws://${window.location.host}`)

ws.onmessage = (e) => {
  const { type, data } = JSON.parse(e.data)

  if (type === 'snapshot') {
    bar.init(Object.keys(data.metrics).map((topic) => _.last(data.metrics[topic])))
  } else if (type === 'metrics') {
    // bar.update(data)
  }
}
