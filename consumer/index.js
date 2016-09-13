'use strict'

const EventEmitter = require('events')
const _ = require('lodash')
const data = require('./data')

const WINDOW = 1000 * 60 * 5
const INTERVAL = 1000
const MAX_LENGTH = WINDOW / INTERVAL

module.exports = class Mock extends EventEmitter {
  constructor () {
    super()

    const now = new Date()
    this.topics = data.topics

    // Backfill dummy metrics with data from each interval
    this.metrics = _.transform(this.topics, (res, topic) => {
      const range = _.range(now.valueOf() - WINDOW, now.valueOf(), INTERVAL)
      let count

      res[topic] = []
      range.forEach((time) => {
        res[topic].push(data.metrics({ id: topic, time: new Date(time), count }))
        count = _.last(res[topic]).count
      })

      return res
    }, {})

    // Dont need a backfill of related words so just start with the latest
    this.related = _.transform(this.topics, (res, topic) => {
      res[topic] = data.metrics({ id: topic, time: now })
      return res
    }, {})
  }

  snapshot () {
    return {
      type: 'snapshot',
      data: {
        topics: this.topics,
        metrics: this.metrics,
        related: this.related
      }
    }
  }

  start () {
    setInterval(() => {
      const time = new Date()
      const now = (obj) => Object.assign({}, obj, { time })

      this.topics.forEach((topic) => {
        const nextMetrics = data.metrics(now(_.last(this.metrics[topic])))
        const nextRelated = data.related(now(this.related[topic]))

        this.metrics[topic] = [...this.metrics[topic].slice(this.metrics[topic].length === MAX_LENGTH ? 1 : 0), nextMetrics]
        this.related[topic] = nextRelated

        this.emit('data', { type: 'metrics', data: nextMetrics })
        this.emit('data', { type: 'related', data: nextRelated })
      })
    }, INTERVAL)
  }
}
