'use strict'

module.exports = class Nav {
  constructor (options) {
    this.legend = document.querySelector(options.legend)
    this.architectureLink = document.querySelector(options.architecture)
    this.main = document.querySelector('main')

    this.architecture()
  }

  architecture () {
    this.architectureLink
      .addEventListener('click', () => this.main.classList.toggle('open'))
  }

  topics (topics) {
    topics.forEach((topic, index) => {
      const li = document.createElement('li')
      li.textContent = topic
      li.classList.add(`color-${index + 1}`)
      this.legend.appendChild(li)
    })
  }
}
