import '../styles/style.css'

import Bar from './charts/bar'

const DATA_INTERVAL = 250

const bar = new Bar({
  selector: '.chart-topics .chart',
  transition: DATA_INTERVAL,
  x: 'topic',
  y: 'tweets',
  data: [
    {topic: 'topic1', tweets: 100},
    {topic: 'topic2', tweets: 150},
    {topic: 'topic3', tweets: 300},
    {topic: 'topic4', tweets: 200}
  ]
})

let iterations = 0

setInterval(() => {
  iterations++
  bar.update([
    {topic: 'topic1', tweets: 100 + Math.ceil(iterations * 0.7)},
    {topic: 'topic2', tweets: 150 + Math.ceil(iterations * 0.6)},
    {topic: 'topic3', tweets: 300 + Math.ceil(iterations * 0.4)},
    {topic: 'topic4', tweets: 200 + Math.ceil(iterations * 0.4)}
  ])
}, DATA_INTERVAL)
