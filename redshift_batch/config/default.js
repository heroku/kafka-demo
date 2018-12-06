const error = (message) => { throw new Error(message) }

const config = {
  "queueSize": 50,
  "timeout": 3000,
  "database": process.env.DATABASE_URL || error('DATABASE_URL env var must be defined.'),
  "kafka": {
    "topic": process.env.KAFKA_TOPIC || error('KAFKA_TOPIC env var must be defined. See `app.json` for default value.'),
    "group": process.env.KAFKA_CONSUMER_GROUP || error('KAFKA_CONSUMER_GROUP env var must be defined. See `app.json` for default value.'),
    "config": {
      "connectionString": process.env.KAFKA_URL || error('KAFKA_URL env var must be defined.'),
      "ssl": {
        "cert": process.env.KAFKA_CLIENT_CERT || error('KAFKA_CLIENT_CERT env var must be defined.'),
        "key": process.env.KAFKA_CLIENT_CERT_KEY || error('KAFKA_CLIENT_CERT_KEY env var must be defined.')
      }
    }
  }
}

if (process.env.KAFKA_PREFIX) {
  config.kafka.topic = process.env.KAFKA_PREFIX + config.kafka.topic;
  config.kafka.group = process.env.KAFKA_PREFIX + config.kafka.group;
}

module.exports = config;
