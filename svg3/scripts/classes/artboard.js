import PageObject from './pageObject.js'
import { elements, settings } from '../elements.js'
import { Path } from '../classes/path.js'
import { mouse } from '../utils.js'


class Artboard extends PageObject {
  constructor(props) {
    super({
      el: Object.assign(document.createElement('div'), {
        className: 'display-wrapper',
        innerHTML: `
          <div class="output">
            <svg class="output-svg" width="100%" height="100%"></svg>
          </div>
          <div class="line-output">
            <svg class="line-output-svg" width="100%" height="100%" fill="transparent"></svg>
          </div>
          <div class="display"></div>
          <div class="resize-handle"></div>
        `
      }),
      ...props,
    })
    this.addToPage()
    elements.artboard = this

    this.display = this.el.querySelector('.display')
    this.output = this.el.querySelector('.output-svg')
    this.lineOutput = this.el.querySelector('.line-output-svg')
    this.resizeHandle = this.el.querySelector('.resize-handle')

    this.display.addEventListener('click', this.createOrUpdatePath)

    mouse.move(document, 'add', e => {
      const { x, y } = this.pos(e)
      elements.indicator.innerHTML = `X${x} Y${y}` 
    })

    mouse.down(this.resizeHandle, 'add', e => {
      this.canResize = true
      this.onGrab(e)
    })
    mouse.up(this.resizeHandle, 'add',()=> this.canResize = false)
  }
  pos(e) {
    const { left, top } = this.display.getBoundingClientRect()
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
      settings.currentPath = new Path({ artboard: this }, this.pos(e))
      settings.addNewPath = false
    } else {
      settings.currentPath.addPoint('L', this.pos(e))
    }
  }
  resizeBox = e =>{
    const { pos } = this.nav
    const { x, y } = this.nav.touchPos(e)
    this.nav.pos.x = x > pos.x ? pos.x : x
    this.nav.pos.y = y > pos.y ? pos.y : y

    this.nav.w = Math.abs(pos.x - x)
    this.nav.h = Math.abs(pos.y - y)
    this.nav.setStyles()

    // this.w = Math.abs(defPos.x - x)
    // this.h = Math.abs(defPos.y - y)
    // this.setStyles()
  }
  saveSvg() {
    const { nav: { w, h }, output: { innerHTML } } = this
    const fileConfig = 'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/"'
    const fileContent = `
      <svg width="${w}" height="${h}" viewport="0 0 ${w} ${h}" ${fileConfig}>
        ${innerHTML}
      </svg>
    `
    const data = new Blob([fileContent], { type: 'text/rtf' })
    const link = Object.assign(document.createElement('a'), {
      download: `${settings.fileName || 'untitled'}_${new Date().getTime()}.svg`,
      href: window.URL.createObjectURL(data)
    })
    link.click()
  }
}

export {
  Artboard
}