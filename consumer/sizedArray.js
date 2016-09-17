'use strict'

module.exports = class SizedArray {
  constructor (size) {
    this._size = size
    this._items = []
  }

  push (items) {
    const current = this._items.length
    const add = items.length
    const max = this._size

    if (current + add >= max) {
      this._items = [...this._items, ...items].slice(current + add - max)
    } else {
      this._items.push(items)
    }
  }

  items () {
    return this._items
  }

  empty () {
    return this._items.length === 0
  }
}
