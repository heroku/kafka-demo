'use strict'

import * as d3 from 'd3'
import _ from 'lodash'

const minMargin = 15
const margin = {
  top: minMargin,
  right: minMargin,
  bottom: minMargin + 8,
  left: minMargin + 17
}

export default class StreamChart {
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

    this.chartArea = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    this.xAxisG = this.chartArea.append('g')
    this.yAxisG = this.chartArea.append('g')
  }

  getHeight () {
    return this.container.clientHeight
  }

  getWidth () {
    return this.container.clientWidth
  }

  formatData (raw) {
    const keys = Object.keys(raw)
    const times = raw[keys[0]].map((d) => d.time)
    return times.map((time, index) => {
      const values = keys.map((key) => raw[key][index].avg)
      return Object.assign({ time }, _.zipObject(keys, values))
    })
  }

  init (data) {
    this._lastData = this.formatData(data)

    this.updateScaleAndAxesData({ first: true })
    this.updateScales({ first: true })
    this.updateAxes({ first: true })
    this.updateStacks({ first: true })
    d3.select(this.container).classed('loading', false)

    window.addEventListener('resize', () => this.resize())
    this._initialized = true
  }

  resize () {
    this.updateScaleAndAxesData()
    this.updateScales()
    this.updateAxes()
    this.updateStacks()
  }

  update (data) {
    if (!this._initialized) return

    this._lastData = [...this._lastData.slice(1), data]

    this.updateScaleAndAxesData({ transition: this.transition })
    this.updateScales({ transition: this.transition })
    this.updateAxes({ transition: this.transition })
    this.updateStacks({ transition: this.transition })
  }

  updateScaleAndAxesData () {
    // Initialise scales
    this.xScale = d3
      .scaleTime()
      .domain(d3.extent(this._lastData, (d) => new Date(d[this.xVariable])))

    this.yScale = d3
      .scaleLinear()
      .domain([0, d3.max(this._lastData, (d) => _.reduce(_.omit(d, this.xVariable), _.add))])

    // Build the x-axis
    this.xAxis = d3
      .axisBottom()
      .scale(this.xScale)

    // Build the y-axis
    this.yAxis = d3
      .axisLeft()
      .scale(this.yScale)
  }

  updateScales () {
    const newWidth = this.getWidth() - margin.left - margin.right
    const newHeight = this.getHeight() - margin.top - margin.bottom

    this.xScale.range([0, newWidth])
    this.yScale.range([newHeight, 0])
  }

  updateAxes (options = {}) {
    const newHeight = this.getHeight()

    // position the xAxisG before the transition the first time
    if (options.first) {
      this.xAxisG.attr('transform', `translate(0, ${newHeight - margin.top - margin.bottom})`)
    }

    this.xAxisG
      .transition()
      .duration(options.transition || 0)
      .attr('transform', `translate(0, ${newHeight - margin.top - margin.bottom})`)
      .call(this.xAxis)

    this.yAxisG
      .transition()
      .duration(options.transition || 0)
      .call(this.yAxis)
  }

  updateStacks (options = {}) {
    const stack = d3
      .stack()
      .keys(Object.keys(_.omit(this._lastData[0], this.xVariable)))
      .order(d3.stackOrderInsideOut)
      .offset(d3.stackOffsetWiggle)

    const series = stack(this._lastData)

    const area = d3
      .area()
      .x((d) => this.xScale(new Date(d.data[this.xVariable])))
      .y0((d) => this.yScale(d[0]))
      .y1((d) => this.yScale(d[1]))
      .curve(d3.curveNatural)

    this.chartArea
      .selectAll('.layer')
      .data(series)
      .enter()
      .append('g')
      .attr('class', 'layer')
      .append('path')
      .attr('class', (__, index) => `chart-color-${index + 1}`)
      .attr('d', area)
  }
}
