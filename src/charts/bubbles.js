'use strict'

import * as d3 from 'd3'
import _ from 'lodash'

export default class BubblesChart {
  constructor (options) {
    this.container = document.querySelector(options.selector)

    this.transition = options.transition

    const svg = d3
      .select(this.container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')

    this.chartArea = svg.append('g')

    this.pack = d3.pack()

    this.stratify = d3.stratify()
      .id((d) => d.id)
      .parentId((d) => d.topic)
  }

  getHeight () {
    return this.container.clientHeight
  }

  getWidth () {
    return this.container.clientWidth
  }

  formatData (raw) {
    return _.reduce(raw, (res, values) => {
      const { relations, id: topic } = _.last(values)
      res.push(..._.map(relations, (count, id) => ({ id, count, topic })))
      return res
    }, [])
  }

  init (data) {
    this._lastData = this.formatData(data)

    this.updateBubbles({ first: true })
    d3.select(this.container).classed('loading', false)

    window.addEventListener('resize', () => this.resize())
    this._initialized = true
  }

  resize () {
    this.updateBubbles()
  }

  update (data) {
    if (!this._initialized) return

    this._lastData = this.formatData(data)

    this.updateBubbles({ transition: this.transition })
  }

  updateBubbles (options = {}) {
    this.pack
      .size([this.getWidth(), this.getHeight()])
  }
}
