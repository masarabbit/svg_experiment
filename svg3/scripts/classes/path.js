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
    ;['width', 'height'].forEach(key => {
      this.el.setAttribute(key, '100%')
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
  addPoint(letter, pos) {
    const newPoint = {
      letter,
      pos,
      isCurve: false,
    }
    this.points.push(newPoint)
    if (letter !== 'Z') {
      newPoint.cNode = {
        xy1: { pos: null },
        xy2: { pos: null },
        left: null,
        right: null
      }
      newPoint.node = new Node({
        path: this,
        point: newPoint,
        container: elements.display,
      })
    }
    this.updatePath()
  }
  updatePath() {
    const newPath = this.points.map(n => {
      const { letter } = n
      if (letter === 'Z') return 'Z'

      const { pos, cNode: { xy1, xy2 } } = n
      return letter === 'C'
          ? `${letter} ${xY(xy1.pos)}, ${xY(xy2.pos)}, ${xY(pos)}`
          : `${letter} ${xY(pos)}`
    }).join(' ')
    settings.inputs.svgInput.value = newPath
    const { fill, stroke, strokeWidth } = settings.svgStyle
    this.svg.el.innerHTML = `<path fill="${fill}" stroke="${stroke}" stroke-width=${strokeWidth} d="${newPath}"></path>`
  }
}


export {
  Path
}