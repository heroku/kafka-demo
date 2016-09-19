'use strict'

module.exports = class Nav {
  constructor (options) {
    this.container = document.querySelector(options.selector)

    this.legend = this.container.querySelector('.nav-legend')
    this.architectureLink = this.container.querySelector('.nav-link.architecture-link')
    this.main = document.querySelector('main')

    this.architecture()
  }

  architecture () {
    document.addEventListener('click', () => this.main.classList.toggle('open'))
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
