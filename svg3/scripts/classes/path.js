import PageObject from './pageObject.js';
import { settings, elements } from '../elements.js';
import { xY } from '../utils.js'

class Node extends PageObject {
  constructor(props) {
    super({
      el: Object.assign(document.createElement('div'), 
      { className: 'node' }),
      point: props.point,
      ...props
    })
    this.setStyles()
    this.addToPage()
    this.addDragEvent()
  }
  get pos() {
    return this.point.pos
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
    const { fill, stroke, strokeWidth } = settings.svgStyle
    const attributes = {
      width: '100%',
      height: '100%',
      fill,
      stroke,
      'stroke-width': strokeWidth
    }
    Object.keys(attributes).forEach(key => {
      this.el.setAttribute(key, attributes[key])
    })
    this.addToPage()
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
  // xY(pos) {
  //   return `${pos.x} ${pos.y}`
  // }
  addPoint(letter, pos) {
    const newPoint = {
      letter,
      pos,
      isCurve: false,
      cNode: {
        xy1: { pos: null },
        xy2: { pos: null },
        left: null,
        right: null
      },
    }
    this.points.push(newPoint)
    newPoint.node = new Node({
      path: this,
      point: newPoint,
      container: elements.display,
    })
  }
  updatePath() {
    const newPath = this.points.map(n => {
      const { letter, pos, cNode: { xy1, xy2 } } = n
      return letter === 'C'
          ? `${letter} ${xY(xy1.pos)}, ${xY(xy2.pos)}, ${xY(pos)}` // TODO this could come from getter?
          : `${letter} ${xY(pos)}`
    }).join(' ')
    settings.inputs.svgInput.value = newPath
    this.svg.el.innerHTML = `<path d="${newPath}"></path>`
  }
}


export {
  Path
}