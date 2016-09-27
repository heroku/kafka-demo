'use strict'

import '../styles/style.css'
import _ from 'lodash'
import Bar from './lib/bar'
import Stream from './lib/stream'
import Stats from './lib/stats'
import Bubbles from './lib/bubbles'
import Nav from './lib/nav'
import { MAX_SIZE, MAX_BUFFER_SIZE, INTERVAL } from '../consumer/constants'

const aggregate = [
  new Nav({
    legend: '.footer-legend ul',
    architecture: '.architecture-link'
  }),
  new Bar({
    selector: '.chart-topics .chart',
    transition: INTERVAL,
    x: 'id',
    y: 'count'
  }),
  new Stream({
    selector: '.chart-stream .chart',
    transition: INTERVAL,
    x: 'time',
    y: 'avgPerSecond',
    maxSize: MAX_BUFFER_SIZE,
    maxDisplaySize: MAX_SIZE
  }),
  new Stats({
    selector: '.chart-stats .chart',
    transition: INTERVAL,
    x: ['avgPerSecond', 'avgPer60Seconds', 'avgPer3600Seconds'],
    titles: ['', 'Last Minute Avg', 'Last Hour Avg']
  })
]

const related = [
  new Bubbles({
    selector: '.chart-related .chart',
    transition: INTERVAL,
    maxRelations: 20
  })
]

const url = `ws${window.location.href.match(/^http(s?:\/\/.*)\/.*$/)[1]}`
const ws = new window.WebSocket(url)

ws.onmessage = (e) => {
  const { type, data } = JSON.parse(e.data)

  switch (type) {
    case 'snapshot':
      _.invokeMap(aggregate, 'init', data.aggregate)
      _.invokeMap(related, 'init', data.relatedwords)
      break

    case 'aggregate':
      _.invokeMap(aggregate, 'update', data)
      break

    case 'relatedwords':
      _.invokeMap(related, 'update', data)
      break
  }
}
