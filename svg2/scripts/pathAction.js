import { elements, settings } from './settings.js'
import { setStyles } from './utils.js'
import { addTouchAction } from './addTouchAction.js'

const xY = pos => `${pos.x} ${pos.y}`

// TODO perhaps rename prev and next, because it's misleading
const updatePath = path => {
  const newPath = path.points.map(n => {
    const { letter, pos, cNode: { xy1, xy2 } } = n
    return letter === 'C'
        ? `${letter} ${xY(xy1.pos)}, ${xY(xy2.pos)}, ${xY(pos)}`
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
        xy1: { pos: { x: 0, y: 0 } },
        xy2: { pos: { x: 0, y: 0 } },
        left: null,
        right: null
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
  addTouchAction({ node: newNode })
}

const cNodeLine = (pointA, pointB) => {
  const lengthX = pointB.x - pointA.x
  const lengthY = pointB.y - pointA.y
  return {
    length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
    angle: Math.atan2(lengthY, lengthX)
  }
}

const cNodePos = ({ currentPos, prevPos, nextPos, reverse }) => {
  const prevPoint = prevPos || currentPos
  const nextPoint = nextPos || currentPos
  const createdLine = cNodeLine(prevPoint, nextPoint)
  const lineAngle = createdLine.angle + (reverse ? Math.PI : 0)
  const lineLength = createdLine.length * settings.svgStyle.smoothing

  const x = currentPos.x + Math.cos(lineAngle) * lineLength || currentPos.x
  const y = currentPos.y + Math.sin(lineAngle) * lineLength || currentPos.y

  return { 
    x: Math.round(x), 
    y: Math.round(y) 
  }
}

const addCnodeEl = ({ point, data, isRightNode }) => {
  const newNode = {
    el: Object.assign(document.createElement('div'), 
    { className: `node c ${isRightNode ? 'right' : 'left'}` }),
    pos: data.pos,
    path: point.path,
    point,
    isRightNode,
  }
  setStyles(newNode)
  elements.display.append(newNode.el)
  addTouchAction({ node: newNode, data })

  if (isRightNode) {
    point.prevPoint.cNode.right = newNode 
    point.prevPoint.cNode.rightLine = {
      start: point.prevPoint,
      end: newNode,
      color: 'red'
    }
  } else {
    point.cNode.left = newNode
    point.cNode.leftLine = {
      start: point,
      end: newNode,
      color: 'blue'
    }
  }
}

const addLeftCnode = point => {
  point.letter = 'C'
  point.isCurve = true
  point.cNode.xy1.pos = point.prevPoint?.pos || point.pos
  point.cNode.xy1.point = point

  point.cNode.xy2.pos = cNodePos({
    currentPos: point.pos,
    prevPos: point.prevPoint?.pos || point.pos,
    nextPos: point.nextPoint?.pos || point.pos,
    reverse: true
  })
  point.cNode.xy2.point = point.prevPoint || point

  updatePath(point.path)
  addCnodeEl({
    data: point.cNode.xy2,
    point,
  })
}

const addRightCnode = point => {
  point.letter = 'C'
  point.isCurve = true
  point.cNode.xy1.pos = cNodePos({
      currentPos: point.prevPoint.pos || point.pos,
      prevPos: point.prevPoint?.prevPoint?.pos || point.pos,
      nextPos: point.pos,
    })

  point.cNode.xy1.point = point
  point.cNode.xy2.pos = point.pos
  point.cNode.xy2.point = point.prevPoint || point

  updatePath(point.path)
  addCnodeEl({ 
    data: point.cNode.xy1,
    point,
    isRightNode: true,
  })
}


export {
  updatePath,
  addPath,
  addNode,
  cNodePos,
  addLeftCnode,
  addRightCnode
}