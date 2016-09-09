'use strict'

const EventEmitter = require('events')
const _ = require('lodash')
const data = require('./data')

// 30 minutes
const WINDOW = 1000 * 60 * 5
const INTERVAL = 250

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
        res[topic].push(data.metrics({ id: topic, time, count }))
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
      this.topics.forEach((topic) => {
        const nextMetrics = data.metrics(_.last(this.metrics[topic]))
        const nextRelated = data.related(this.related[topic])

        this.metrics[topic] = [...this.metrics[topic].slice(1), nextMetrics]
        this.related[topic] = nextRelated

        this.emit('data', { type: 'metrics', data: nextMetrics })
        this.emit('data', { type: 'related', data: nextRelated })
      })
    }, INTERVAL)
  }
}
