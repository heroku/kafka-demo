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

  if (type === 'snapshot') {
    topics = Object.keys(data.metrics)
    charts.forEach(c => c.init(data.metrics))
  } else if (type === 'metrics') {
    // Dont update charts until all topics have arrived
    updateData[data.id] = data
    if (_.size(updateData) === _.size(topics)) {
      charts.forEach(c => c.update(updateData))
      updateData = {}
    }
  } else if (type === 'config') {
    topics = data
  }
}
