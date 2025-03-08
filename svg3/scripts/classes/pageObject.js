import { px, nearestN, roundedClient, mouse, distanceBetween } from '../utils.js'
import { settings } from '../elements.js'

class PageObject {
  constructor(props) {
    Object.assign(this, {
      grabPos: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
      ...props,
    })
  }
  get size() {
    return {
      w: this.w,
      h: this.h,
    }
  }
  setStyles() {
    Object.assign(this.el.style, {
      left: px(this.pos.x || 0),
      top: px(this.pos.y || 0),
      width: px(this.w),
      height: px(this.h || this.w),
    })
  }
  addToPage() {
    this.container.appendChild(this.el)
  }
  remove() {
    this.el.remove()
  }
  touchPos(e) {
    return {
      x: nearestN(roundedClient(e, 'X'), settings.snap),
      y: nearestN(roundedClient(e, 'Y'), settings.snap)
    }
  }
  addDragEvent() {
    mouse.down(this.el, 'add', this.onGrab)
  }
  addXy(xY) {
    this.pos.x -= xY.x
    this.pos.y -= xY.y
  }
  drag = (e, x, y) => {
    // e.preventDefault()
    if (e.type[0] === 'm') e.preventDefault()
    this.grabPos.a.x = this.grabPos.b.x - x
    this.grabPos.a.y = this.grabPos.b.y - y
    this.dragAction()
    if (this.extraDragAction) this.extraDragAction()
  }
  dragAction() {
    this.addXy(this.grabPos.a)
    this.setStyles()
  }
  onGrab = e => {
    e.preventDefault()
    this.grabPos.b = this.touchPos(e)
    mouse.up(document, 'add', this.onLetGo)
    mouse.move(document, 'add', this.onDrag)
  }
  onDrag = e => {
    e.preventDefault()
    const { x, y } = this.touchPos(e)
    this.canResize
      ? this.resizeBox(e)
      : this.drag(e, x, y)
    this.grabPos.b.x = x
    this.grabPos.b.y = y
  }
  onLetGo = () => {
    mouse.up(document, 'remove', this.onLetGo)
    mouse.move(document, 'remove', this.onDrag)
  }
  distanceBetween(target) {
    return distanceBetween(target, this.pos)
  }
}

export default PageObject