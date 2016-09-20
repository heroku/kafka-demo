'use strict'

import * as d3 from 'd3'
import _ from 'lodash'

const minMargin = 15
const margin = {
  top: minMargin,
  right: minMargin,
  bottom: minMargin + 8,
  left: minMargin + 37
}

export default class BarChart {
  constructor (options) {
    this.container = document.querySelector(options.selector)

    this.xVariable = options.x
    this.yVariable = options.y
    this.transition = options.transition

    const svg = d3
      .select(this.container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')

    const chartArea = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    this.barGroup = chartArea.append('g')
    this.xAxisG = chartArea.append('g')
    this.yAxisG = chartArea.append('g')

    this.xScale = d3.scaleBand()
      .paddingInner(0.1)
      .paddingOuter(0.1)

    this.yScale = d3.scaleLinear()

    this.xAxis = d3.axisBottom()
    this.yAxis = d3.axisLeft()
      .tickFormat(d3.format('.2s'))
  }

  getHeight () {
    return this.container.clientHeight - margin.top - margin.bottom
  }

  getWidth () {
    return this.container.clientWidth - margin.left - margin.right
  }

  formatData (data) {
    return Object.keys(data).map((topic) => _.last(data[topic]))
  }

  init (data) {
    this._lastData = this.formatData(data)

    this.updateScaleAndAxesData({ first: true })
    this.updateScales({ first: true })
    this.updateAxes({ first: true })
    this.updateBars({ first: true })
    d3.select(this.container).classed('loading', false)

    window.addEventListener('resize', () => this.resize())
    this._initialized = true
  }

  resize () {
    this.updateScaleAndAxesData()
    this.updateScales()
    this.updateAxes()
    this.updateBars()
  }

  update (data) {
    if (!this._initialized) return

    this._lastData = this.formatData(data)

    this.updateScaleAndAxesData({ transition: this.transition })
    this.updateScales({ transition: this.transition })
    this.updateAxes({ transition: this.transition })
    this.updateBars({ transition: this.transition })
  }

  updateScaleAndAxesData () {
    this.xScale
      .domain(this._lastData.map(d => d[this.xVariable]))

    this.yScale
      .domain([0, d3.max(this._lastData.map(d => d[this.yVariable]))])
      .nice()

    this.xAxis.scale(this.xScale)
    this.yAxis.scale(this.yScale)
  }

  updateScales () {
    this.xScale.range([0, this.getWidth()])
    this.yScale.range([this.getHeight(), 0])
  }

  updateAxes (options = {}) {
    if (options.first) {
      this.xAxisG.attr('transform', `translate(0, ${this.getHeight()})`)
    }

    this.xAxisG
      .transition()
      .duration(options.transition || 0)
      .attr('transform', `translate(0, ${this.getHeight()})`)
      .call(this.xAxis)

    this.yAxisG
      .transition()
      .duration(options.transition || 0)
      .call(this.yAxis)
  }

  updateBars (options = {}) {
    const updateSelection = this.barGroup
      .selectAll('.chart-rect')
      .data(this._lastData)

    const enterSelection = updateSelection
      .enter()
      .append('rect')
      .attr('class', (__, index) => `chart-rect chart-color-${index + 1}`)

    updateSelection
      .exit()
      .remove()

    enterSelection
      .merge(updateSelection)
      .transition()
      .duration(options.transition || 0)
      .attr('x', (d) => this.xScale(d[this.xVariable]))
      .attr('width', this.xScale.bandwidth)
      .attr('y', (d) => this.yScale(d[this.yVariable]))
      .attr('height', (d) => this.yScale(0) - this.yScale(d[this.yVariable]))

    enterSelection
      .append('svg:title')
      .text((d) => d.count)
  }
}
