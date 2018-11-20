const config = {
  "queueSize": 50,
  "timeout": 3000,
  "database": "postgres://fritzy@localhost:5432/fritzy",
  "kafka": {
    "topic": "ecommerce-logs",
    "group": "redshift-batch",
    "config": {
      "connectionString": process.env.KAFKA_URL || "kafka://localhost:9092",
      "ssl": {
        "cert": process.env.KAFKA_CLIENT_CERT || "",
        "key": process.env.KAFKA_CLIENT_CERT_KEY || ""
      }
    }
  }
}

if (process.env.KAFKA_PREFIX) {
  config.kafka.topic = process.env.KAFKA_PREFIX + config.kafka.topic;
  config.kafka.group = process.env.KAFKA_PREFIX + config.kafka.group;
}

module.exports = config;
