import '../styles/style.css'

import _ from 'lodash'
import Stream from './lib/stream'
import Nav from './lib/nav'
import { MAX_SIZE, MAX_BUFFER_SIZE, INTERVAL } from '../consumer/constants'

const aggregate = [
  new Nav({
    legend: '.footer-legend ul',
    architecture: '.architecture-link'
  }),
  new Stream({
    selector: '.chart-stream .chart',
    transition: INTERVAL,
    x: 'time',
    y: 'avgPerSecond',
    maxSize: MAX_BUFFER_SIZE,
    maxDisplaySize: MAX_SIZE
  })
]

const url = `ws${window.location.href.match(/^http(s?:\/\/.*)\/.*$/)[1]}`
const ws = new window.WebSocket(url)

ws.onmessage = (e) => {
  const { type, data } = JSON.parse(e.data)

  switch (type) {
    case 'snapshot':
      _.invokeMap(aggregate, 'init', data.aggregate)
      break

    case 'aggregate':
      _.invokeMap(aggregate, 'update', data)
      break
  }
}
