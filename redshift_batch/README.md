# redshift\_batch

Batches kafka messages into redshift.

## Install

`npm install`

Copy config/default.json to config/local.json then edit the production.json

```js
{
  "queueSize": 50, // number of msgs to queue up before inserting
  "timeout": 3000, // max time to queue before inserting
  "database": "postgres://fritzy@localhost:5432/fritzy", // pg connection string
  "kafka": {  
    "topic": "ecommerce-logs", // kafka topic
    "group": "redshift-batch", // consumer group id
    "config": { // no-kafka configuration object
      "kafkaHost": "kafka://localhost:9092",
      "ssl": {
        "key": "",
        "cert: ""
      }
    }
  }
}
```

```sql
CREATE TABLE ecommercelogs(id serial, time TIMESTAMP WITH TIME ZONE, session VARCHAR(255), action VARCHAR(255), product VARCHAR(255), category VARCHAR(255), campaign VARCHAR(255))
```

## Running

`node index.js`
