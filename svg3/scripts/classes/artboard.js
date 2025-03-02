import PageObject from './pageObject.js'
import { elements } from '../elements.js'


class Artboard extends PageObject {
  constructor(props) {
    super({
      el: Object.assign(document.createElement('div'), {
        className: 'display-wrapper',
        innerHTML: `
          <div class="output">
            <svg width="100%" height="100%"></svg>
          </div>
          <div class="display"></div>
          <div class="line-output"></div>
        `
      }),
      ...props,
    })
    this.addToPage()
    elements.artboard = this

    // TODO this bit could be renamed so it could be looped
    elements.display = this.el.querySelector('.display')
    elements.output = this.el.querySelector('svg')
    elements.lineOutput = this.el.querySelector('.line-output')
    console.log(elements)

    elements.display.addEventListener('click', e => this.action(e, this))
  }
  pos(e) {
    const { left, top } = elements.display.getBoundingClientRect()
    return {
      x: e.pageX - left - window.scrollX,
      y: e.pageY - top - window.scrollY
    }  
  }
  addDragEvent() {
    mouse.down(this.el, 'add', this.onGrab)
    mouse.enter(this.el,'add', ()=> {
      if (settings.drawMode === 'curve') return
      settings.prevDrawMode = settings.drawMode
      settings.drawMode = 'drag'
    })
    mouse.leave(this.el,'add', ()=> {
      if (settings.drawMode === 'curve') return
      settings.drawMode = settings.prevDrawMode
    })
  }
}

export {
  Artboard
}