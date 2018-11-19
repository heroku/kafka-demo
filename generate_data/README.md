# Heroku Kafka AWS Redshift MetaBase -- Data Generator

## First Time

Install the modules.
`npm i`

Create or using an existing config.

`node index.js -c [file.json]`

## Startup

`node index.js -c fixture.json`

`node index.js -c kafka.json`

## JSON config file fields

```js
{
  "maxWait": 10, // float, max number of seconds to wait between log entries if the volume is 0
  "campaignVolumeMult": 1.5, // float, factor to increase the volume, following the campaign start
  "maxSessions": 500, // max number of sessions to simulate at a time (affected by current volume)
  "campaign": "ae271515-3b71-4c02-88b1-a009fe34279e", // campaign unique id
  "startTime": "2018-09-02T07:00:00-07:00", // simulation start time
  "endTime": "2018-09-03T00:00:00-07:00", // simulation end time
  "campaignTime": "2018-09-02T06:10:00-07:00", // simulation time that the campaign factor starts (and wishlisting)
  "primeUntil": "2018-09-02T09:00:00-07:00", // for a kafka output, simulate as fast as you can until this time to prime the sessions
  "campaignPercentage": 0.33, // float 0.0-1.0 what percentage of sessions should be campaign session after the session start time
  "skipBatchEvents": true, // don't send kafka events during the prime
  "mode": "", // no longer used
  "output": {
    "type": "kafka", // kafka or csv
    "topic": "ecommerce-logs", // kafka specific topic
    "kafka": { // config that initializes no-kafka client
      "connectionString": "kafka://localhost:9092"
      "ssl": {
        "cert": "",
        "key": "",
      }
    }
  },
  "badCategory": "EKUX", // category of products where the wishlist feature is broken
  "products": { // any number of products
    "sku": { // unique sku for product
      "category: "sub-sku", // category of product
      "weight": 49 // 0-100 integer wait 
    }
  },
  volume: [ // array of 24 floats 0.0 - 1.0 to indicate the relative volume percentage
  ]
}
```

