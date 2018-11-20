const _ = require('lodash')
const Kafka = require('no-kafka')
const SizedArray = require('./sizedArray')

const combine = (arr1, arr2, combinator) =>
  _.flatten(arr1.map((a) => arr2.map((b) => combinator(a, b))))

module.exports = class Consumer {
  constructor({ interval, maxSize, broadcast, topic, consumer }) {
    this._maxSize = maxSize
    this._snapshot = new SizedArray(maxSize)
    this._broadcast = broadcast

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
      .then((latest) =>
        consumer.subscribe(
          topic,
          0,
          {
            offset: latest - this._maxSize
          },
          this.onMessage.bind(this)
        )
      )
  }

  onMessage(messageSet) {
    const items = messageSet
      .map((m) => JSON.parse(m.message.value.toString('utf8')))
      .filter(({ action }) => action === 'WISHLIST')

    const initial = this._snapshot.empty()
    this._snapshot.push(items)

    if (!initial) {
      this._broadcast({
        type: 'aggregate',
        data: items
      })
    }
  }

  snapshot() {
    return {
      type: 'snapshot',
      data: this._snapshot.items()
    }
  }
}
