'use strict'

import _ from 'lodash'

export default class Stats {
  constructor (options) {
    this.container = document.querySelector(options.selector)
    this.xVariable = options.x
    this.xTitles = options.titles
  }

  formatData (data) {
    return _.map(data, (values) => {
      const value = _.last(values)
      return this.xVariable.map((x) => value[x])
    })
  }

  init (data) {
    this._lastData = this.formatData(data)

    this.initTable(data)
    this.updateTable({ first: true })
    this.container.classList.remove('loading')

    this._initialized = true
  }

  initTable (data) {
    // Build initial static parts of table
    const topics = Object.keys(data)
    const cells = this.xVariable
    const table = document.createElement('table')

    topics.forEach((topic) => {
      const tr = document.createElement('tr')
      const title = document.createElement('td')

      tr.classList.add('data')
      title.textContent = topic
      tr.appendChild(title)
      cells.forEach((cell) => tr.appendChild(document.createElement('td')))
      table.appendChild(tr)
    })

    const labels = document.createElement('tr')
    labels.classList.add('title')
    labels.appendChild(document.createElement('td'))
    this.xTitles.forEach((label) => {
      const td = document.createElement('td')
      td.textContent = label
      labels.appendChild(td)
    })
    table.appendChild(labels)

    this._table = table
    this.container.appendChild(table)
  }

  update (data) {
    if (!this._initialized) return

    this._lastData = this.formatData(data)

    this.updateTable()
  }

  updateTable () {
    const trs = this._table.querySelectorAll('tr')

    this._lastData.forEach((row, rowIndex) => {
      const tds = trs[rowIndex].querySelectorAll('td')
      row.forEach((cell, index) => {
        const td = tds[index + 1]
        td.textContent = cell == null ? 'N/A' : (index === 0 ? cell : cell.toFixed(3))
      })
    })
  }
}
