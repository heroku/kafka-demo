'use strict'

import * as d3 from 'd3'
import _ from 'lodash'
import dateFormat from 'dateformat'

export default class BubblesChart {
  constructor (options) {
    this.container = document.querySelector(options.selector)

    this.transition = options.transition / 2
    this.maxRelations = options.maxRelations
    this._useInitial = false

    const svg = d3
      .select(this.container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')

    this.chartArea = svg
      .append('g')

    this.tooltip = d3.select(this.container)
      .append('div')
      .style('opacity', 0)
  }

  getHeight () {
    return this.container.clientHeight
  }

  getWidth () {
    return this.container.clientWidth
  }

  getClass (d) {
    return `chart-color-${this._topics.indexOf(d.topic) + 1} ${d.name}`
  }

  formatData (raw, initial) {
    const length = _.size(raw)

    return _.transform(raw, (res, values, topic) => {
      const previousValues = initial[topic]
      const previous = _.map(_.last(previousValues).relations, (r, name) => ({ name, r, topic }))
      const relations = _.map(_.last(values).relations, (r, name) => ({
        name,
        topic,
        r: (r - (this._useInitial ? (_.find(previous, { name }) || { r: 0 }).r : 0)) || 1
      }))

      const topRelations = _.orderBy(relations, ['r', 'name'], ['desc', 'desc'])
      res.push(...topRelations.slice(0, Math.floor(this.maxRelations / length)))

      return res
    }, [])
  }

  init (data) {
    this._topics = Object.keys(data)
    this._lastData = this.formatData(data, data)
    this._initialData = data

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

    this._lastData = this.formatData(data, this._initialData)

    this.updateBubbles({ transition: this.transition })
  }

  updateBubbles (options = {}) {
    const data = d3.packSiblings(this._lastData)
    const enclose = d3.packEnclose(this._lastData)

    const height = this.getHeight()
    const width = this.getWidth()
    const center = { x: width / 2, y: height / 2 }
    const translate = `${center.x},${center.y}`
    const scale = Math.min(height, width) / ((enclose.r || 1) * 2)

    this._textWidths = this._textWidths || {}
    const calcFontSize = 12
    const fontSize = (d, index, nodes) => {
      const size = ((d.r * 2) / this._textWidths[d.name]) * calcFontSize * 0.7
      const relativeSize = size * scale
      return relativeSize < 10 ? 0 : `${size}px`
    }

    const showTooltip = (d) => {
      this.tooltip
        .transition()
        .duration(200)
        .style('opacity', 1)

      this.tooltip.html(`${d.name}<br/>${d.r}`)

      this.tooltip
        .style('left', `${(d.x * scale) + (width / 2) - (this.tooltip.node().clientWidth / 2)}px`)
        .style('top', `${(d.y * scale) + (height / 2) + (d.r * scale) + 2}px`)
        .attr('class', `tooltip ${this.getClass(d)}`)
    }

    const hideTooltip = () => {
      this.tooltip
        .transition()
        .duration(200)
        .style('opacity', 0)
    }

    this.chartArea
      .transition()
      .duration(options.transition)
      .ease(d3.easeLinear)
      .attr('transform', `translate(${translate}) scale(${scale})`)

    const containers = this.chartArea
      .selectAll('.circle-node')
      .data(data, ({ name, topic }) => `${name}-${topic}`)

    /*
     * EXITING
     */
    const exiting = containers.exit()

    exiting
      .transition()
      .duration(this.transition * 0.5)
      .ease(d3.easeLinear)
      .attr('transform', `translate(0,0)`)
      .remove()

    exiting
      .select('circle')
      .transition()
      .duration(this.transition * 0.5)
      .ease(d3.easeLinear)
      .style('opacity', 0)
      .attr('r', 0)

    exiting
      .select('text')
      .remove()

    /*
     * UPDATE EXISTING
     */
    containers
      .on('mouseenter', showTooltip)
      .on('mouseleave', hideTooltip)
      .transition()
      .duration(options.transition)
      .ease(d3.easeLinear)
      .attr('transform', (d) => `translate(${d.x},${d.y})`)

    containers
      .select('circle')
      .transition()
      .duration(options.transition)
      .ease(d3.easeLinear)
      .attr('r', (d) => d.r)

    containers
      .select('text')
      .transition()
      .duration(options.transition)
      .ease(d3.easeLinear)
      .style('font-size', fontSize)

    /*
     * ADD NEW
     */
    const enter = containers
      .enter()
      .append('g')

    enter
      .attr('class', 'circle-node')
      .attr('transform', 'translate(0,0)')
      .on('mouseenter', showTooltip)
      .on('mouseleave', hideTooltip)
      .transition()
      .duration(options.transition)
      .ease(d3.easeLinear)
      .attr('transform', (d) => `translate(${d.x},${d.y})`)

    enter
      .append('circle')
      .attr('class', (d) => this.getClass(d))
      .attr('r', (d) => d.r)

    // Keep a cache of all related words' computed text length
    enter
      .filter((d) => !this._textWidths[d.name])
      .append('text')
      .attr('font-size', `${calcFontSize}px`)
      .text((d) => d.name)
      .each((d, i, nodes) => {
        this._textWidths[d.name] = nodes[i].getComputedTextLength()
        nodes[i].remove()
      })

    enter
      .append('text')
      .text((d) => d.name)
      .style('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('dy', '.35em')
      .style('font-size', fontSize)
  }
}
