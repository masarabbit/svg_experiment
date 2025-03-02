import PageObject from './pageObject.js';
import { settings } from '../elements.js';
import { xY, kebabToCamelCase, mouse } from '../utils.js'

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
    this.path.updatePath()
    this.handleLine.update()
    if (this.pair) {
      this.pair.pos = this.getOffsetPos()
      this.pair.setStyles()
      this.pair.handleLine.update()
    }
  }
}

class NodeLine {
  constructor(props) {
    Object.assign(this, {
      el: document.createElementNS('http://www.w3.org/2000/svg','line'),
      container: props.point.path.artboard.lineOutput,
      ...props
    })
    this.container.appendChild(this.el)
    this.update()
  }
  update() {
    const lineStyle = {
      stroke: this.color,
      'stroke-width': this.strokeWidth,
      x1: this.point.pos.x,
      y1: this.point.pos.y,
      x2: this.cNode.pos.x,
      y2: this.cNode.pos.y,
    }
    Object.keys(lineStyle).forEach(key => {
      this.el.setAttribute(key, lineStyle[key])
    })
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
    this.handleLine = new NodeLine({
      point: this.point,
      cNode: this,
      color: 'orange'
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
    this.handleLine = new NodeLine({
      point: this.point,
      cNode: this,
      color: 'red'
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
    if (this.point.letter !== 'Z') this.addClickEvent()
  }
  get pos() {
    return this.point.pos
  }
  addClickEvent() {
    this.el.addEventListener('click', ()=> {
      if (settings.drawMode === 'curve') {
        if (this.point === this.path.firstPoint && this.path.lastPoint && !this.path.lastPoint.leftNode) {
          this.path.lastPoint.addLeftNode()
        } else if(this.point.prevPoint && !this.point.leftNode) this.point.addLeftNode()
        if(this.point.nextPoint && !this.point.rightNode) this.point.addRightNode()
        this.path.updatePath()
      }
    })
  }
  extraDragAction() {
    this.path.updatePath()
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
          this.point[node].handleLine.update()
        }
      })
    }
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
        container: this.path.artboard.display,
        className: this.letter + this.pointIndex
      })
    }
  }
  addXy(xY) {
    this.pos.x -= xY.x
    this.pos.y -= xY.y
  }
  get pointIndex() {
    return this.path.points.indexOf(this)
  }
  get prevPoint() {
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
  addLeftNode() {
    this.letter = 'C'
    this.isCurve = true
    this.leftNode = new LeftNode({
      path: this.path,
      point: this,
      container: this.path.artboard.display,
    })
  }
  addRightNode() {
    this.nextPoint.letter = 'C'
    this.nextPoint.isCurve = true
    this.rightNode = new RightNode({
      path: this.path,
      point: this,
      container: this.path.artboard.display,
    })
  }
}

class Path extends PageObject {
  constructor(props, pos) {
    super({
      el: document.createElementNS('http://www.w3.org/2000/svg','path'),
      pos: { x: 0, y: 0 },
      canMove: true,
      points: [],
      container: props.artboard.output,
      svgStyle: settings.svgStyle,
      id: settings.idCount,
      ...props
    })
    this.addToPage()
    this.addPoint('M', pos)
    this.addDragEvent()
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

    ;['fill', 'stroke', 'stroke-width'].forEach(key=> {
      this.el.setAttribute(key, this.svgStyle[kebabToCamelCase(key)])
    })
    this.el.setAttribute('d', newPath)
  }
  dragAction() {
    this.points.forEach(point => {
      if (point.letter === 'Z') return
      // when we have last point, we should only move M once
      if (!this.lastPoint || point.letter !== 'M') point.addXy(this.grabPos.a)
      if (point.mainNode) point.mainNode.setStyles()
      ;['leftNode', 'rightNode'].forEach(node => {
        if (point[node]) {
          point[node].addXy(this.grabPos.a)
          point[node].setStyles()
          point[node].handleLine.update()
        }
      })
    })
    this.updatePath()
  }
}


// class Svg extends PageObject {
//   constructor(props) {
//     super({
//       el: Object.assign(document.createElementNS('http://www.w3.org/2000/svg', 'svg'), {
//         id: `svg-${props.id}`,
//       }),
//       ...props,
//     })
//     ;['width', 'height'].forEach(key => {
//       this.el.setAttribute(key, '100%')
//     })
//     this.addToPage()
//   }
// }


export {
  Path
}