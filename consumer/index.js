'use strict'

const _ = require('lodash')
const Kafka = require('no-kafka')
const SizedArray = require('./sizedArray')

const combine = (arr1, arr2, combinator) => _.flatten(arr1.map((a) => arr2.map((b) => combinator(a, b))))

module.exports = class Consumer {
  constructor (options, broadcast) {
    this._topics = options.topics
    this._types = options.types
    this._broadcast = options.broadcast
    this._kafkaTopics = combine(this._topics, this._types, (topic, type) => `${topic.name}-${type.name}`)

    // Create a separate consumer for each topic since each topic needs a specific offset
    this._consumers = this._kafkaTopics.map((clientId) => {
      const defaultOptions = { idleTimeout: 100 }
      const id = { clientId }
      return new Kafka.SimpleConsumer(Object.assign(defaultOptions, options.consumer, id))
    })

    this._toBroadcast = {}
    this._snapshot = {}

    this._types.forEach((type) => {
      this._snapshot[type.name] = {}
      this._toBroadcast[type.name] = {}

      this._topics.forEach((topic) => {
        this._snapshot[type.name][topic.name] = new SizedArray(type.maxSize)
      })
    })
  }

  init () {
    return Promise.all(this._consumers.map((consumer) => consumer.init().then(() => {
      const topic = consumer.options.clientId
      const { maxSize } = _.find(this._types, (type) => type.name === topic.split('-')[1])
      if (maxSize && maxSize > 1) {
        // If there is maxSize for this topic then start from the latest offset
        // and rewind by that many messages for the subscription offset
        return consumer.offset(topic).then((latest) => this._subscribe(consumer, { offset: latest - maxSize }))
      } else {
        return this._subscribe(consumer, { time: Kafka.LATEST_OFFSET })
      }
    })))
  }

  snapshot () {
    return {
      type: 'snapshot',
      data: _.mapValues(this._snapshot, (type) => _.mapValues(type, (data) => data.items()))
    }
  }

  _subscribe (consumer, options = {}) {
    const topic = consumer.options.clientId
    return consumer.subscribe(topic, 0, options, (messageSet) => {
      const [name, type] = topic.split('-')
      const messages = messageSet.map((m) => Object.assign({ id: name }, JSON.parse(m.message.value.toString('utf8'))))
      const initial = this._snapshot[type][name].empty()

      // This will be an array that wont exceed the `maxSize` passed in for each topic
      this._snapshot[type][name].push(messages)

      if (!initial) {
        // After the initial fetch, broadcast all topics together once each has
        // been received from kafka
        this._toBroadcast[type][name] = (this._toBroadcast[type][name] || []).concat(messages)

        // If all topics have been received then broadcast and reset the object
        if (_.size(this._toBroadcast[type]) === this._topics.length) {
          this._broadcast({
            type,
            // Make sure broadcast data only has the same key order
            data: this._topics.reduce((res, orderTopic) => {
              res[orderTopic.name] = this._toBroadcast[type][orderTopic.name]
              return res
            }, {})
          })

          this._toBroadcast[type] = {}
        }
      }
    })
  }
}
