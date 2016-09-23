'use strict'

// Millisecond interval to expect new data
const interval = module.exports.INTERVAL = 1000

// Max items to display for rolling data
// Use a 10% buffer to prevent transitions from being too small for the chart bounds
const maxSize = module.exports.MAX_SIZE = 1 * 60 * (1000 / interval)
module.exports.MAX_BUFFER_SIZE = Math.floor(maxSize * 1.10)

module.exports.TOPICS = process.env.TWITTER_TRACK_TERMS.split(',')
