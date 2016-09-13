'use strict'

import _ from 'lodash'

export default class Stats {
  constructor (options) {
    this.container = document.querySelector(options.selector)
    this.xVariable = options.x
  }

  formatData (data) {
    const keys = Object.keys(data)
    return keys.map((topic) => {
      const values = data[topic]
      const value = Array.isArray(values) ? _.last(values) : values
      return [topic, ...this.xVariable.map((x) => value[x])]
    })
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

    this._lastData.forEach((row) => {
      const tr = document.createElement('tr')
      table.appendChild(tr)
      row.forEach((cell) => {
        const td = document.createElement('td')
        td.textContent = typeof cell === 'number' ? `${cell}/s` : cell
        tr.appendChild(td)
      })
    })
  }
}
