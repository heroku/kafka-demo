# Kafka-stream-viz



## Structure

This project includes 3 apps: generate\_data, reshift\_batch, and viz. Each app is in its corresponding directory.

## Install

### Prerequisites

- An AWS RedShift cluster. If you want an easy way to create a RedShift cluster, a Heroku Private Space, and peering between the Private Space and AWS VPC in which the RedShift cluster lives, check out [this Terraform script](https://github.com/heroku-examples/terraform-heroku-peered-redshift).

- Add animated GIF to readme
- Finish bottom of this README
- Update `viz` README
- Try out demo script
- Edit demo script
- Record demo script

### Heroku

```
git clone git@github.com:heroku-examples/kafka-stream-viz.git
cd kafka-stream-viz
heroku create
heroku addons:create heroku-kafka:basic-0
git push heroku master
```

Optionally, you can also deploy Metabase to Heroku and query data in RedShift. Use [Metabase's Heroku Deploy button](https://elements.heroku.com/buttons/metabase/metabase). Once deployed, you'll need to configure Metabase with RedShift cluster URL, database name, username, and password.

### Local

```
git clone git@github.com:heroku-examples/kafka-stream-viz.git
npm i
```

## Run

The following environment variables must be defined. If you used the Heroku install instructions above, all of them are already defined except for `DATABASE_URL`.

- `DATABASE_URL`: Connection string to an AWS RedShift cluster
- `KAFKA_URL`: Comma-separated list of Apache Kafka broker URLs
- `KAFKA_CLIENT_CERT`: Contents of the client certificate (in PEM format) to authenticate clients against the broker
- `KAFKA_CLIENT_CERT_KEY`: Contents of the client certificate key (in PEM format) to authenticate clients against the broker
- `KAFKA_TOPIC`: Kafka topic the system will produce to and consume from
- `KAFKA_PREFIX`: (optional) This is only used by [Heroku's multi-tenant Apache Kafka plans](https://devcenter.heroku.com/articles/multi-tenant-kafka-on-heroku) (i.e. `basic` plans)

Then in each of the `generate_data`, `viz`, and `redshift_batch` directories, run `npm start`.

Open the URL in the startup output of the `viz` app. It will likely be `http://localhost:3000`.

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

#### Development Server

```shell
npm run dev
```

Open http://localhost:3000 in a browser and watch tweets stream in...

#### Theming

There are two themes: `heroku` and `salesforce`. The default is `heroku`. The theme change be changed by setting the `THEME` environment variable.

#### Deploy

```shell
git clone git@github.com:crcastle/twitter-display.git
cd twitter-display
heroku create
```

You can define the below environment variables manually, or you can run this command to define them from another app that already has a Kafka cluster attached: `heroku addons:attach my-originating-app::KAFKA` (where "my-originating-app" is the app to which the cluster is already attached)

Or manually:

```
heroku config:set KAFKA_URL=
heroku config:set KAFKA_CLIENT_CERT=
heroku config:set KAFKA_CLIENT_CERT_KEY=
heroku config:set KAFKA_TOPIC=
```
