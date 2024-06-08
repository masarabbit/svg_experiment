import { elements, settings } from './settings.js'
import { setStyles } from './utils.js'
import { addTouchAction } from './addTouchAction.js'

const updatePath = path => {
  const newPath = path.points.map(n => {
    const { letter, pos: { x, y } } = n
    return `${letter} ${x} ${y}`
  }).join(', ')
  elements.svgInput.value = newPath
  path.svg.innerHTML = `<path d="${newPath}"></path>`
}

const addPath = pos => {
  const { fill, stroke, strokeWidth, idCount } = settings
  settings.paths.push({
    points: [{
      letter: 'M',
      pos
    }],
    svg: null,
    fill,
    stroke,
    strokeWidth,
    id: idCount
  })
}

const addNode = ({ pos, path, point }) => {
  const newNode = {
    el: Object.assign(document.createElement('div'), 
    { className: 'node' }),
    pos,
    path,
    point
  }
  setStyles(newNode)
  elements.display.append(newNode.el)
  addTouchAction(newNode)
}

export {
  updatePath,
  addPath,
  addNode
}