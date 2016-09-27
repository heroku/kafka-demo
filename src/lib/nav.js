'use strict'

module.exports = class Nav {
  constructor (options) {
    this.legend = document.querySelector(options.legend)
    this.architectureLink = document.querySelector(options.architecture)
    this.main = document.querySelector('main')
    this.architectureFrame = document.querySelector('.architecture-iframe')

    this.architecture()
  }

  formatData (data) {
    return Object.keys(data)
  }

  architecture () {
    this.architectureLink.addEventListener('click', () => {
      const isOpen = this.main.classList.contains('open')
      if (isOpen) {
        this.architectureFrame.removeAttribute('src')
        this.main.classList.remove('open')
      } else {
        this.architectureFrame.setAttribute('src', '/images/kafka-diagram/kafka-diagram.html')
        this.main.classList.add('open')
      }
    })
  }

  init (data) {
    this.formatData(data).forEach((topic, index) => {
      const li = document.createElement('li')
      li.textContent = topic
      li.classList.add(`color-${index + 1}`)
      this.legend.appendChild(li)
    })
  }
}
