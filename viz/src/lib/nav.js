module.exports = class Nav {
  constructor(options) {
    this.legend = document.querySelector(options.legend)
    this.architectureLink = document.querySelector(options.architecture)
    this.main = document.querySelector('main')
    this.architectureFrame = document.querySelector('.architecture-iframe')

    this.architecture()
    this.toggleView()
  }

  formatData(data) {
    return Object.keys(data)
  }

  architecture() {
    this.architectureLink.addEventListener('click', () => {
      const isOpen = this.main.classList.contains('open')
      if (isOpen) {
        this.architectureFrame.removeAttribute('src')
        this.main.classList.remove('open')
      } else {
        this.architectureFrame.setAttribute(
          'src',
          '/public/kafka-diagram/kafka-diagram-v2.html'
        )
        this.main.classList.add('open')
      }
    })
  }

  toggleView() {
    const toggleLinks = document.querySelectorAll('.toggle')
    toggleLinks.forEach((toggleLink) => {
      toggleLink.addEventListener('click', (event) => {
        const currentLink = event.currentTarget.getAttribute('name') // toggle button
        const currentToggleable = document.querySelector(
          `.toggleable[name="${currentLink}"]`
        ) // element to toggle
        const isShown = currentToggleable.classList.contains('show')
        const isOpen = this.main.classList.contains('open') // if this is true, then the architecture diagram is open and we need to close it
        if (isShown) {
          currentToggleable.classList.remove('show')
        } else {
          currentToggleable.classList.add('show')
          if (isOpen) {
            this.architectureFrame.removeAttribute('src')
            this.main.classList.remove('open')
          }
        }
      })
    })
  }

  init() {}

  update(data) {
    this.formatData(data).forEach((topic, index) => {
      if (!this.legend.querySelector(`#topic-${topic}`)) {
        const li = document.createElement('li')
        li.textContent = topic
        li.setAttribute('id', `topic-${topic}`)
        li.classList.add(`color-${index + 1}`)
        this.legend.appendChild(li)
      }
    })
  }
}
