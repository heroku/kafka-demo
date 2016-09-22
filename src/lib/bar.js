'use strict'

import * as d3 from 'd3'
import _ from 'lodash'
import dateFormat from 'dateformat'

const minMargin = 15
const margin = {
  top: minMargin,
  right: minMargin,
  bottom: minMargin + 25,
  left: minMargin + 37
}

export default class BarChart {
  constructor (options) {
    this.container = document.querySelector(options.selector)

    this.xVariable = options.x
    this.yVariable = options.y
    this.transition = options.transition / 2
    this._useInitial = true

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

    this.xAxisLabel = chartArea.append('text')
      .attr('class', 'label')

    this.yAxisLabel = chartArea.append('text')
      .attr('class', 'label')

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

  yValue (d) {
    return d[this.yVariable] - (this._useInitial ? _.find(this._initialData, { id: d.id })[this.yVariable] : 0)
  }

  formatData (data) {
    return Object.keys(data).map((topic) => _.last(data[topic]))
  }

  init (data) {
    this._lastData = this.formatData(data)
    this._initialData = this._lastData

    if (this._useInitial) {
      const startTime = new Date(Math.min(...this._lastData.map((d) => d.time)))
      this.container.parentNode.querySelector('.start-time').textContent = dateFormat(startTime, 'h:MM:ss TT')
    } else {
      this.container.parentNode.querySelector('.start-time-container').remove()
    }

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
      .domain([0, d3.max(this._lastData.map((d) => this.yValue(d)))])
      .nice()

    this.xAxis.scale(this.xScale)
    this.yAxis.scale(this.yScale)
  }

  updateScales () {
    this.xScale.range([0, this.getWidth()])
    this.yScale.range([this.getHeight(), 0])
  }

  updateAxes (options = {}) {
    this.xAxisG
      .attr('transform', `translate(0, ${this.getHeight()})`)
      .call(this.xAxis)

    this.xAxisLabel
      .attr('transform', `translate(${this.getWidth() / 2}, ${this.getHeight() + (margin.bottom - 7)})`)
      .style('text-anchor', 'middle')
      .text('Keywords')

    this.yAxisG
      .call(this.yAxis)

    this.yAxisLabel
      .attr('transform', `translate(${(margin.left * -1) + 19}, ${this.getHeight() / 2}) rotate(-90)`)
      .style('text-anchor', 'middle')
      .text('Message Count')
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
      .ease(d3.easeLinear)
      .attr('x', (d) => this.xScale(d[this.xVariable]))
      .attr('width', this.xScale.bandwidth)
      .attr('y', (d) => this.yScale(this.yValue(d)))
      .attr('height', (d) => this.yScale(0) - this.yScale(this.yValue(d)))
  }
}
