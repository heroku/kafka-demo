'use strict'

import '../styles/style.css'
import _ from 'lodash'
import Bar from './charts/bar'
import Stream from './charts/stream'
import Stats from './charts/stats'

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

const stats = window.stream = new Stats({
  selector: '.chart-stats .chart',
  transition: 1000,
  x: ['avg', 'avg60', 'avg600']
})

const charts = [bar, stream, stats]
const ws = new window.WebSocket(`ws://${window.location.host}`)

let topics = []
let updateData = {}

ws.onmessage = (e) => {
  const { type, data } = JSON.parse(e.data)

  switch (type) {
    case 'snapshot':
      topics = Object.keys(data.metrics)
      _.invokeMap(charts, 'init', data.metrics)
      break

    case 'metrics':
      updateData[data.id] = data
      if (Object.keys(updateData).length === topics.length) {
        _.invokeMap(charts, 'update', updateData)
        updateData = {}
      }
      break

    case 'config':
      topics = data
  }
}
