import PageObject from './pageObject.js';
import { settings, elements } from '../elements.js';
import { xY } from '../utils.js'

class Node extends PageObject {
  constructor(props) {
    super({
      el: Object.assign(document.createElement('div'), 
      { className: `node ${props.className}` }),
      point: props.point,
      ...props
    })
  }
  setUp() {
    this.setStyles()
    this.addToPage()
    this.addDragEvent()
  }
}

class CurveNode extends Node {
  constructor(props) {
    super({
      isCurveNode: true,
      pos: { x: 0, y: 0 },
      ...props
    })
    this.setDefaultPos()
    this.setUp()
  }
  get prevPoint() {
    if (this.point === this.path.firstPoint && this.path.lastPoint) return this.path.lastPoint.prevPoint.pos
    return this.point.prevPoint?.pos || this.point.pos
  }
  get nextPoint() {
    if (this.point === this.path?.lastPoint) return this.path.firstPoint.nextPoint.pos
    return this.point.nextPoint?.pos || this.point.pos
  }
  get cNodeLine() {
    const lengthX = this.nextPoint.x - this.prevPoint.x
    const lengthY = this.nextPoint.y - this.prevPoint.y
    return {
      length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
      angle: Math.atan2(lengthY, lengthX)
    }
  }
  get lineLength() {
    return this.cNodeLine.length * settings.svgStyle.smoothing
  }
  get lineAngle() {
    return this.cNodeLine.angle + this.angleOffset
  }
  setDefaultPos() {  
    // TODO this isn't quite right when lastPoint and firstPoint is related
    // const point = this.path.firstPoint === this.point ? this.path.lastPoint : this.point
    const x = this.point.pos.x + Math.cos(this.lineAngle) * this.lineLength || this.point.pos.x 
    const y = this.point.pos.y + Math.sin(this.lineAngle) * this.lineLength || this.point.pos.y
  
    this.pos = {
      x: Math.round(x),
      y: Math.round(y) 
    }
  }
  get angleToAxis() {
    return Math.atan2(this.pos.y - this.axis.pos.y, this.pos.x - this.axis.pos.x) + Math.PI
  } 
  getOffsetPos() {
    const distance = this.pair.distanceBetween(this.axis.pos)
    return {
      x: Math.round(this.axis.pos.x + (distance * Math.cos(this.angleToAxis))),
      y: Math.round(this.axis.pos.y + (distance * Math.sin(this.angleToAxis)))
    }
  }
  extraDragAction() {
    if (this.pair) {
      this.pair.pos = this.getOffsetPos()
      this.pair.setStyles()
    }
  }
}

class LeftNode extends CurveNode {
  constructor(props) {
    super({
      className: 'left',
      axis: props.point,
      angleOffset: Math.PI,
      ...props,
    })
  }
  get pair() {
    if (this.path.lastPoint === this.point) return this.path.firstPoint.rightNode
    return this.point.rightNode
  }
}

class RightNode extends CurveNode {
  constructor(props) {
    super({
      className: 'right',
      axis: props.point,
      angleOffset: 0,
      ...props,
    })
  }
  get pair() {
    if (this.path.firstPoint === this.point && this.path.lastPoint) return this.path.lastPoint.leftNode
    return this.point.leftNode
  }
}


class MainNode extends Node {
  constructor(props) {
    super(props)
    this.setUp()
    this.el.addEventListener('click', ()=> {
      if (settings.drawMode === 'curve' &&  this.point.letter !== 'Z') {
        if (this.point === this.path.firstPoint && this.path.lastPoint && !this.path.lastPoint.leftNode) {
          this.path.lastPoint.addLeftNode()
        } else if(this.point.prevPoint 
          // && this.point.letter !== 'M' 
          && !this.point.leftNode) this.point.addLeftNode()
        if(this.point.nextPoint.letter !== 'Z' && this.point.nextPoint && !this.point.rightNode) this.point.addRightNode()
        this.path.updatePath()
      }
    })
  }
  get pos() {
    return this.point.pos
  }
  extraDragAction() {
    if (this.point === this.path.firstPoint && this.path.lastPoint?.leftNode) {
      this.path.lastPoint.leftNode.addXy(this.grabPos.a)
      this.path.lastPoint.leftNode.setStyles()
      this.point.rightNode.addXy(this.grabPos.a)
      this.point.rightNode.setStyles()
    } else {
      ;['leftNode', 'rightNode'].forEach(node => {
        if (this.point[node]) {
          this.point[node].addXy(this.grabPos.a)
          this.point[node].setStyles()
        }
      })
    }
  }
}

class Svg extends PageObject {
  constructor(props) {
    super({
      el: Object.assign(document.createElementNS('http://www.w3.org/2000/svg', 'svg'), {
        id: `svg-${props.id}`,
      }),
      ...props,
    })
    ;['width', 'height'].forEach(key => {
      this.el.setAttribute(key, '100%')
    })
    this.addToPage()
  }
}

class Point {
  constructor(props) {
    Object.assign(this, {
      letter: props.letter,
      pos: props.pos,
      isCurve: false,
      ...props
    })
    this.path.points.push(this)
    if (this.letter !== 'Z' && !this.isLastPoint) {
      this.mainNode = new MainNode({
        path: this.path,
        point: this,
        container: elements.display,
        className: this.letter + this.pointIndex
      })
    }
  }
  get pointIndex() {
    return this.path.points.indexOf(this)
  }
  get prevPoint() {
    // TODO this will be different if line is closed
    // if (this.pointIndex === 1) return this.path.lastPoint
    // if (this.pointIndex === 1) this.path.points?.[this.pointIndex - 3]
    if (this === this.path.firstPoint && this.path.lastPoint) return this.path.isLastPoint
    return this.path.points?.[this.pointIndex - 1]
  }
  get nextPoint() {
    if (this === this.path.lastPoint) return this.path.firstPoint
    return this.path.points?.[this.pointIndex + 1]
  }
  get xy1() {
    return this.prevPoint?.rightNode?.pos || this.prevPoint?.pos || this.pos
  }
  get xy2() {
    return this?.leftNode?.pos || this.pos
  }
  lineHtml(color, end) {
    return `<line stroke="${color}" stroke-width="1" x1="${this.pos.x}" y1="${this.pos.y}" x2="${end.pos.x}" y2="${end.pos.y}"/>`
  }
  get leftLine() {
    return this.leftNode ? this.lineHtml('orange', this.leftNode) : ''
  }
  get rightLine() {
    return this.rightNode ? this.lineHtml('red', this.rightNode) : ''
  }
  addLeftNode() {
    this.letter = 'C'
    this.isCurve = true
    this.leftNode = new LeftNode({
      path: this.path,
      point: this,
      container: elements.display,
    })
  }
  addRightNode() {
    this.nextPoint.letter = 'C'
    this.nextPoint.isCurve = true
    this.rightNode = new RightNode({
      path: this.path,
      point: this,
      container: elements.display,
    })
  }
}


class Path extends PageObject {
  constructor(props, pos) {
    super({
      points: [],
      svg: new Svg({
        id: 'test',
        container: elements.output,
      }),
      svgStyle: settings.svgStyle,
      id: settings.idCount,
      ...props
    })
    this.addPoint('M', pos)
  }
  get firstPoint() {
    return this.points?.[0]
  }
  addPoint(letter, pos) {
    new Point({ letter, pos, path: this })
    this.updatePath()
  }
  closePath() {
    this.lastPoint = new Point({ 
      letter: 'L', 
      pos: this.firstPoint.pos,
      path: this,
      isLastPoint: true
    })
    new Point({ letter: 'Z', path: this })
    this.updatePath()
  }
  updateLines() {
    elements.lineOutput.innerHTML = `<svg class="line" width="100%" height="100%" fill="transparent">
    ${this.points.map(p => p.leftLine + p.rightLine).join('')}
  </svg>`
  }
  updatePath() {
    const newPath = this.points.map(n => {
      const { letter } = n
      if (letter === 'Z') return 'Z'

      const { pos, xy1, xy2 } = n
      return letter === 'C'
          ? `${letter} ${xY(xy1)}, ${xY(xy2)}, ${xY(pos)}`
          : `${letter} ${xY(pos)}`
    }).join(' ')
    settings.inputs.svgInput.value = newPath
    const { fill, stroke, strokeWidth } = settings.svgStyle
    this.svg.el.innerHTML = `<path fill="${fill}" stroke="${stroke}" stroke-width=${strokeWidth} d="${newPath}"></path>`
    this.updateLines()
  }
}


export {
  Path
}