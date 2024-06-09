import { elements, settings } from './settings.js'
import { setStyles } from './utils.js'
import { addTouchAction } from './addTouchAction.js'

const xY = pos => `${pos.x} ${pos.y}`


const updatePath = path => {
  const newPath = path.points.map(n => {
    const { letter, pos, cNode: { prev, next } } = n
    return letter === 'C'
        ? `${letter} ${xY(prev.pos)}, ${xY(next.pos)}, ${xY(pos)}`
        : `${letter} ${xY(pos)}`
  }).join(' ')
  elements.svgInput.value = newPath
  path.svg.innerHTML = `<path d="${newPath}"></path>`
}

const addPath = pos => {
  settings.paths.push({
    points: [{
      letter: 'M',
      pos,
      isCurve: false,
      cNode: {
        prev: {
          pos: { x: 0, y: 0 }
        },
        next: {
          pos: { x: 0, y: 0 }
        }
      },
    }],
    svg: null,
    svgStyle: settings.svgStyle,
    id: settings.idCount
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