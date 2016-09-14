'use strict'

const _ = require('lodash')

// Topics and related words with a range of how many to add per second
const TOPICS = {
  yolo: { range: [10, 11], relations: { swag: [0, 3], hey: [0, 5], cool: [0, 1] } },
  news: { range: [35, 40], relations: { nyt: [0, 7], election: [0, 5], politics: [0, 5] } },
  sports: { range: [25, 30], relations: { baseball: [0, 6], basketball: [0, 5], olympics: [0, 4] } },
  python: { range: [6, 8], relations: { code: [0, 1], test: [0, 2], cool: [0, 1] } }
}

// Increment a metrics object based on its range
const metrics = ({ id, time, count = 0 } = {}) => {
  const perSecond = _.random(...TOPICS[id].range)
  return {
    id,
    time,
    count: count + perSecond,
    avg: perSecond,
    avg60: _.random(...TOPICS[id].range),
    avg600: _.random(...TOPICS[id].range)
  }
}

// Increment a related obejct based on its range
const related = ({ id, time, relations = {} } = {}) => ({
  id,
  time,
  relations: _.transform(TOPICS[id].relations, (res, range, word) => {
    res[word] = (relations[word] || 0) + _.random(...range)
    return res
  }, {})
})

module.exports = {
  metrics,
  related,
  topics: Object.keys(TOPICS)
}
