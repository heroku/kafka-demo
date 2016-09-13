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

    this.xScale = d3.scaleTime()
    this.yScale = d3.scaleLinear()
    this.xAxis = d3.axisBottom()
    this.yAxis = d3.axisLeft()

    this.stack = d3
      .stack()
      .order(d3.stackOrderInsideOut)
      .offset(d3.stackOffsetWiggle)

    this.area = d3
      .area()
      .x((d) => this.xScale(new Date(d.data[this.xVariable])))
      .y0((d) => this.yScale(d[0]))
      .y1((d) => this.yScale(d[1]))
      .curve(d3.curveNatural)
  }

  getHeight () {
    return this.container.clientHeight - margin.top - margin.bottom
  }

  getWidth () {
    return this.container.clientWidth - margin.left - margin.right
  }

  formatData (raw) {
    const keys = Object.keys(raw)
    const values = raw[keys[0]]
    const isArray = Array.isArray(values)
    const x = (isArray ? values : [values]).map((d) => d[this.xVariable])
    const data = x.map((value, index) => {
      const values = keys.map((key) => (isArray ? raw[key][index] : raw[key])[this.yVariable])
      return Object.assign({ [this.xVariable]: value }, _.zipObject(keys, values))
    })
    return isArray ? data : data[0]
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

    this._lastData = [...this._lastData.slice(1), this.formatData(data)]

    this.updateScaleAndAxesData({ transition: this.transition })
    this.updateScales({ transition: this.transition })
    this.updateAxes({ transition: this.transition })
    this.updateStacks({ transition: this.transition })
  }

  updateScaleAndAxesData () {
    this.xScale.domain(d3.extent(this._lastData, (d) => new Date(d[this.xVariable])))
    this.yScale.domain([0, d3.max(this._lastData, (d) => _.reduce(_.omit(d, this.xVariable), _.add))])
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

  updateStacks (options = {}) {
    this.stack.keys(Object.keys(_.omit(this._lastData[0], this.xVariable)))

    const updateSelection = this.chartArea
      .selectAll('.chart-path')
      .data(this.stack(this._lastData))

    const enterSelection = updateSelection
      .enter()
      .append('path')
      .attr('class', (__, index) => `chart-path chart-color-${index + 1}`)

    updateSelection
      .exit()
      .remove()

    enterSelection
      .merge(updateSelection)
      .transition()
      .duration(options.transition || 0)
      .attr('d', this.area)
  }
}
