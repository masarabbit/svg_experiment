import PageObject from './pageObject.js'
import { elements, settings } from '../elements.js'
import { Path } from '../classes/path.js'


class Artboard extends PageObject {
  constructor(props) {
    super({
      el: Object.assign(document.createElement('div'), {
        className: 'display-wrapper',
        innerHTML: `
          <div class="output">
            <svg class="output-svg" width="100%" height="100%"></svg>
          </div>
          <div class="display"></div>
          <div class="line-output">
            <svg class="line-output-svg" width="100%" height="100%" fill="transparent"></svg>
          </div>
        `
      }),
      ...props,
    })
    this.addToPage()
    elements.artboard = this

    // TODO this bit could be renamed so it could be looped
    elements.display = this.el.querySelector('.display')
    elements.output = this.el.querySelector('.output-svg')
    elements.lineOutput = this.el.querySelector('.line-output-svg')
    console.log(elements)

    elements.display.addEventListener('click', this.createOrUpdatePath)
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
  createOrUpdatePath = e => {
    if (settings.drawMode !== 'plot') return
    if (settings.addNewPath) {
      settings.currentPath = new Path({}, this.pos(e))
      settings.addNewPath = false
    } else {
      settings.currentPath.addPoint('L', this.pos(e))
    }
  }
}

export {
  Artboard
}