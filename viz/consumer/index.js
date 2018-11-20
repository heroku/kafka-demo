//const _ = require('lodash')
const Kafka = require('no-kafka')
const SizedArray = require('./sizedArray')
const Moment = require('moment')

/*
const combine = (arr1, arr2, combinator) =>
  _.flatten(arr1.map((a) => arr2.map((b) => combinator(a, b))))
*/

module.exports = class Consumer {
  constructor({ interval, maxSize, broadcast, topic, consumer }) {
    this._maxSize = maxSize
    this._snapshot = new SizedArray(maxSize)
    this._broadcast = broadcast

    this.startTime = null
    this.latestTime = null
    this.categories = {}

    this._consumer = new Kafka.SimpleConsumer({
      idleTimeout: interval,
      connectionTimeout: 10 * 1000,
      clientId: topic,
      ...consumer
    })
  }

  init() {
    const { _consumer: consumer } = this
    const { clientId: topic } = consumer.options

    return consumer
      .init()
      .then(() => consumer.offset(topic))
      .then((latest) => {
        consumer.subscribe(
          topic,
          0,
          {
            offset: latest - this._maxSize
          },
          this.onMessage.bind(this)
        )
        setInterval(this.cullAndBroadcast.bind(this), 1000)
      })
  }

  onMessage(messageSet) {
    const items = messageSet
      .map((m) => JSON.parse(m.message.value.toString('utf8')))
      .filter(({ action }) => action === 'WISHLIST')

    for (const item of items) {
      const time = Moment(item.time)

      if (!this.categories.hasOwnProperty(item.category)) {
        if (this.startTime === null) {
          this.startTime = time
        }

        this.categories[item.category] = {
          id: item.category,
          times: [],
          first: time,
          count: 0,
          avgPerSecond: 0,
          avgPer60Seconds: 0,
          avgPer3600Seconds: 0
        }
      }
      this.categories[item.category].times.push(time)
      this.categories[item.category].count++
      if (this.latestTime === null || time.isAfter(this.latestTime)) {
        this.latestTime = time.clone()
      }
    }

    const initial = this._snapshot.empty()
    this._snapshot.push(items)

    if (!initial) {
      /*
      this._broadcast({
        type: 'aggregate',
        data: items
      })
      */
    }
  }

  cullAndBroadcast() {
    const items = []
    for (const category of Object.keys(this.categories)) {
      const collate = this.categories[category]
      const cullFrom = this.latestTime.clone().subtract(60, 'seconds')
      let idx = 0
      let cullCount = 0
      do {
        if (collate.times[idx].isBefore(cullFrom)) {
          cullCount++
        } else {
          break
        }
        idx++
      } while (idx <= collate.times.length)
      for (idx = 0; idx < cullCount; idx++) {
        collate.times.shift()
      }

      let timeRange = 60
      let avgPerSecond = 0
      if (this.latestTime !== null && collate.times.length > 0) {
        if (collate.first.isAfter(cullFrom)) {
          timeRange = this.latestTime.diff(collate.times[0], 'seconds')
        }
        avgPerSecond = collate.times.length / timeRange
      }
      items.push({
        id: collate.id,
        count: collate.count,
        avgPerSecond: avgPerSecond
      })
    }
    this._broadcast({
      type: 'aggregate',
      data: items
    })
  }

  snapshot() {
    return {
      type: 'snapshot',
      data: this._snapshot.items()
    }
  }
}
