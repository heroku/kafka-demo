'use strict'

import _ from 'lodash'

export default class Stats {
  constructor (options) {
    this.container = document.querySelector(options.selector)
    this.xVariable = options.x
    this.xTitles = options.titles
  }

  formatData (data) {
    const keys = Object.keys(data)
    const rows = keys.map((topic) => {
      const value = _.last(data[topic])
      return [topic, ...this.xVariable.map((x) => value[x])]
    })

    rows.push(['', ...this.xTitles])
    return rows
  }

  init (data) {
    this._lastData = this.formatData(data)

    this.container.appendChild(document.createElement('table'))

    this.updateTable({ first: true })
    this.container.classList.remove('loading')

    this._initialized = true
  }

  update (data) {
    if (!this._initialized) return

    this._lastData = this.formatData(data)

    this.updateTable()
  }

  updateTable () {
    const table = this.container.querySelector('table')
    _.invokeMap(table.querySelectorAll('tr'), 'remove')

    this._lastData.forEach((row, rowIndex) => {
      const isTitle = rowIndex === (this._lastData.length - 1)
      const tr = document.createElement('tr')
      tr.classList.add(isTitle ? 'title' : 'data')
      table.appendChild(tr)

      row.forEach((cell, index) => {
        const td = document.createElement('td')
        let text
        if (cell == null) {
          text = 'N/A'
        } else if (typeof cell === 'string') {
          text = cell
        } else if (typeof cell === 'number') {
          text = index === 1 ? cell : cell.toFixed(3).replace('.000', '')
        }
        td.textContent = text
        tr.appendChild(td)
      })
    })
  }
}
