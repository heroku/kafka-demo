const Postgres = require('pg-promise')({
    capSQL: true
});
const Config = require('getconfig');
const Kafka = require('kafka-node');
const { performance } = require('perf_hooks');

const db = Postgres(Config.database);
db.connect();
const ecommTable = new Postgres.helpers.ColumnSet(['time', 'session', 'action', 'product', 'category', 'campaign'], {table: 'ecommercelogs'});

const kafkaClient = new Kafka.Client();
const kafkaConsumer = new Kafka.Consumer(
  kafkaClient, [
    {
      topic: Config.kafka.topic,
      partition: 0
    }
  ], {
    groupId: Config.kafka.group,
    autoCommit: false
  });



let queue = [];
let lastUpdate = performance.now();
let lock = false;

kafkaConsumer.on('message', (msg) => {
  const now = performance.now();
  const sinceLast = now - lastUpdate;
  const value = JSON.parse(msg.value);
  const length = queue.push(value);
  //console.log(length);
  if (lock === false && (length >= Config.queueSize || sinceLast > Config.timeout)) {
    console.log(queue.length);
    lock = true;
    lastUpdate = now;
    const query = Postgres.helpers.insert(queue, ecommTable);
    db.query(query, queue)
      .then((data) => {
        kafkaConsumer.commit(() => {
          lock = false;
          console.log('unlock');
        });
      })
      .catch((err) => {
        lock = false;
        console.log(err);
      });
    queue = [];
  }
});

