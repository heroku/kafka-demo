'use strict'

import * as d3 from 'd3'
import _ from 'lodash'
import dateFormat from 'dateformat'

const dataId = ({ name, topic }) => `${name}-${topic}`
const tooltipHtml = ({ name, r }) => `${name}<br/>${r}`
const CALC_FONT_SIZE = 12

export default class BubblesChart {
  constructor (options) {
    this.container = document.querySelector(options.selector)

    this.transition = options.transition / 2
    this.maxRelations = options.maxRelations
    this._useInitial = false
    this._textWidths = {}

    const svg = d3
      .select(this.container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')

    this.chartArea = svg
      .append('g')

    this.tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
  }

  getHeight () {
    return this.container.clientHeight
  }

  getWidth () {
    return this.container.clientWidth
  }

  getClass (d) {
    return `chart-color-${this._topics.indexOf(d.topic) + 1}`
  }

  formatData (raw) {
    const length = _.size(raw)

    return _.transform(raw, (res, values, topic) => {
      let previous = []
      if (this._useInitial) {
        previous = _.map(_.last(this._initialData[topic]).relations, (r, name) => ({ name, r, topic }))
      }

      const relations = _.map(_.last(values).relations, (r, name) => ({
        name,
        topic,
        r: (r - (_.find(previous, { name }) || { r: 0 }).r) || 1
      }))

      const topRelations = _.orderBy(relations, ['r', 'name'], ['desc', 'desc'])
      res.push(...topRelations.slice(0, Math.floor(this.maxRelations / length)))

      return res
    }, [])
  }

  init (data) {
    this._topics = Object.keys(data)
    this._initialData = data
    this._lastData = this.formatData(data)

    if (this._useInitial) {
      const startTime = new Date(Math.min(..._.map(data, (d) => _.last(d).time)))
      this.container.parentNode.querySelector('.start-time').textContent = dateFormat(startTime, 'h:MM:ss TT')
    } else {
      this.container.parentNode.querySelector('.start-time-container').remove()
    }

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
    const data = d3.packSiblings(this._lastData)
    const enclose = d3.packEnclose(this._lastData)

    const height = this.getHeight()
    const width = this.getWidth()
    const center = { x: width / 2, y: height / 2 }
    const scale = Math.min(height, width) / ((enclose.r * 2) || 1)

    const hideTooltip = () => this.tooltip.attr('id', null).style('opacity', 0)
    const showTooltip = (d) => {
      this.tooltip.html(tooltipHtml(d))

      const rect = this.container.getBoundingClientRect()
      const node = this.tooltip.node()

      this.tooltip
        .attr('id', dataId(d))
        .style('left', `${(d.x * scale) + (width / 2) - (node.clientWidth / 2) + rect.left}px`)
        .style('top', `${(d.y * scale) + (height / 2) + (d.r * scale) + 2 + rect.top}px`)
        .attr('class', `tooltip ${this.getClass(d)}`)
        .style('opacity', 1)
    }

    // Update tooltip html if it is active
    const tid = this.tooltip.attr('id')
    if (tid) this.tooltip.html(tooltipHtml(_.find(data, (d) => dataId(d) === tid)))

    const updateSelection = this.chartArea
      .selectAll('.circle-node')
      .data(data, dataId)

    const updateCircles = updateSelection
      .select('circle')

    const updateText = updateSelection
      .select('text')

    /*
     * Setup initial properties on entering elements that wont change
     * on new data
     */
    const enterSelection = updateSelection
      .enter()
      .append('g')
      .attr('class', 'circle-node')
      .style('text-anchor', 'middle')
      .style('opacity', 0)
      .attr('transform', `translate(${center.x}, ${center.y}) scale(0)`)
      .on('mouseenter', showTooltip)
      .on('mouseleave', hideTooltip)

    const enterCircles = enterSelection
      .append('circle')
      .attr('class', (d) => this.getClass(d))
      .attr('r', 0)

    const enterText = enterSelection
      .append('text')
      .text((d) => d.name)
      .style('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('dy', '.35em')

    /*
     * Animate out and remove exiting data
     */
    updateSelection
      .exit()
      .transition()
      .duration(this.transition * 0.5)
      .ease(d3.easeLinear)
      .style('opacity', 0)
      .attr('transform', `translate(${center.x}, ${center.y}) scale(0)`)
      .remove()

    /*
     * Keep a cache of all related words' computed text length
     */
    enterSelection
      .filter((d) => !this._textWidths[d.name])
      .append('text')
      .attr('font-size', `${CALC_FONT_SIZE}px`)
      .text((d) => d.name)
      .each((d, i, nodes) => {
        this._textWidths[d.name] = nodes[i].getComputedTextLength()
        nodes[i].remove()
      })

    /*
     * Merge current and new elements are animate them the same
     */
    enterSelection
      .merge(updateSelection)
      .transition()
      .duration(options.transition)
      .ease(d3.easeLinear)
      .style('opacity', 1)
      .attr('transform', (d) => `translate(${(d.x * scale) + center.x},${(d.y * scale) + center.y}) scale(${scale})`)

    enterCircles
      .merge(updateCircles)
      .transition()
      .duration(options.transition)
      .ease(d3.easeLinear)
      .attr('r', (d) => d.r)

    enterText
      .merge(updateText)
      .style('font-size', (d) => {
        const size = ((d.r * 2) / (this._textWidths[d.name] || 50)) * CALC_FONT_SIZE * 0.7
        const relativeSize = size * scale
        return relativeSize < 10 ? 0 : `${size}px`
      })
  }
}
