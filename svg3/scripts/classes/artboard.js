import PageObject from './pageObject.js'
import { elements, settings } from '../elements.js'
import { Path } from '../classes/path.js'
import { mouse, hex, rgbToHex, nearestN } from '../utils.js'


class Canvas extends PageObject {
  constructor(props) {
    super({
      el: Object.assign(document.createElement('canvas'), {
        className: 'artboard-canvas',
      }),
      colors: [],
      ...props,
    })
    this.nav.contentWrapper.appendChild(this.el)
    this.ctx = this.el.getContext('2d', { willReadFrequently: true })
    setTimeout(()=> this.resizeCanvas())
  }
  get d() {
    return settings.strokeWidth
  }
  get w() {
    return Math.round(this.nav.contentWrapper.getBoundingClientRect().width)
  }
  get h() {
    return Math.round(this.nav.contentWrapper.getBoundingClientRect().height)
  }
  get column() {
    return Math.round(this.w / this.d) 
  }
  get row() {
    return Math.round(this.h / this.d) 
  }
  resizeCanvas() {
    this.el.setAttribute('width', this.w)
    this.el.setAttribute('height', this.h)
  }
  extractColors() {
    this.colors.length = 0
    const { d } = this  
    const w = this.column
    const h = this.row

    const offset = Math.floor(d / 2)
    for (let i = 0; i < w * h; i++) {
      const x = i % w * d
      const y = Math.floor(i / w) * d
      const c = this.ctx.getImageData(x + offset, y + offset, 1, 1).data //offset
      // this thing included here to prevent rendering black instead of transparent
      c[3] === 0
        ? this.colors.push('transparent')
        : this.colors.push(hex(rgbToHex(c[0], c[1], c[2])))
    }
  }
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.w, this.h)
  }
  paintCanvas() {
    this.extractColors()
    this.clearCanvas()
    this.ctx.fillRect(0, 0, this.w, this.h)
    const { d } = this
    this.colors.forEach((c, i) => {
      this.ctx.fillStyle = c || 'transparent'
      this.ctx.fillRect(this.calcX(i) * d, this.calcY(i) * d, d, d)
    })
  }
  calcX(cell) {
    return cell % this.column
  }
  calcY(cell) {
    return Math.floor(cell / this.column)
  }
}

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
    this.canvas = new Canvas({ nav: this.nav })

    this.display.addEventListener('click', this.createOrUpdatePath)

    mouse.move(document, 'add', e => {
      // e.preventDefault()
      const { x, y } = this.pos(e)
      elements.indicator.innerHTML = `X${x} Y${y}` 
    })

    mouse.down(this.resizeHandle, 'add', e => {
      // e.preventDefault()
      this.canResize = true
      this.onGrab(e)
    })
    mouse.up(this.resizeHandle, 'add', ()=> this.canResize = false)
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
    this.canvas.resizeCanvas()
    this.updatePixelation()
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
    const data = new Blob([fileContent], { type: 'svg' })
    const link = Object.assign(document.createElement('a'), {
      download: `${settings.fileName || 'untitled'}_${new Date().getTime()}.svg`,
      href: window.URL.createObjectURL(data)
    })
    link.click()
  }
  updatePixelation() {
    ;['column', 'row'].forEach(n => settings.inputs[n].value = this.canvas[n])
    if (settings.shouldPixelate) elements.artboard.pixelate()
  }
  pixelate() {
    elements.artboard.output.classList.add('d-none') 
    elements.artboard.canvas.clearCanvas()   
    settings.paths.forEach(p => {
      const { d, svgStyle: { stroke, strokeWidth, fill } } = p
      const { ctx } = elements.artboard.canvas
      const path = new Path2D(d)
      ctx.strokeStyle = stroke
      ctx.lineWidth = strokeWidth
      ctx.stroke(path)
      ctx.fillStyle = fill
      ctx.fill(path)
    })
    elements.artboard.canvas.paintCanvas()      
  }
  roundBoardSize() {
    const { d } = this.canvas
    this.nav.w = nearestN(this.nav.w, d)
    this.nav.h = nearestN(this.nav.h, d)
    this.nav.setStyles()
    this.canvas.resizeCanvas()
  }
  downloadImage = () => {
    const { d, column, row } = this.canvas
    this.roundBoardSize()
    settings.shouldPixelate = true
    this.pixelate()

    const link = document.createElement('a')

    link.download = `svg_d[${d}]col[${column}]row[${row}]${new Date().getTime()}.png`
    link.href = this.canvas.el.toDataURL()
    link.click()
  }
}

export {
  Artboard
}