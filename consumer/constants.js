'use strict'

// Millisecond interval to expect new data
module.exports.INTERVAL = 1000

// Max items to display for rolling data
module.exports.MAX_SIZE = 1 * 60 * (1000 / module.exports.INTERVAL)

module.exports.TOPICS = ['news', 'music']
