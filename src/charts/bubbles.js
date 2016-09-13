'use strict'

import * as d3 from 'd3'

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
  }

  getHeight () {
    return this.container.clientHeight
  }

  getWidth () {
    return this.container.clientWidth
  }

  formatData (raw) {
    return raw
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
  }
}
