## kafka-stream-viz

A simple app that streams tweets containing a specified set of keywords to web browser clients.

Keywords are specified in the kafka-tweets app. They are read from a Kafka topic named 'test' from the 0th (zeroth) partition in that topic.

#### Development Setup

```shell
npm install
```

Additionally these environment variables need to be defined:

- `KAFKA_URL`: A comma separated list of SSL URLs to the Kafka brokers making up the cluster.
- `KAFKA_CLIENT_CERT`: The required client certificate (in PEM format) to authenticate clients against the broker.
- `KAFKA_CLIENT_CERT_KEY`: The required client certificate key (in PEM format) to authenticate clients against the broker.
- `KAFKA_TOPIC`: The Kafka topics to subscribe to.
- `KAFKA_PREFIX`: (optional) This is only used by [Heroku's multi-tenant Apache Kafka plans](https://devcenter.heroku.com/articles/multi-tenant-kafka-on-heroku) (i.e. `basic` plans)

#### Development Server

```shell
npm run dev
```

Open http://localhost:3000 in a browser and watch data stream in...
```
