import { elements, settings } from './settings.js'
import { setStyles } from './utils.js'
import { addTouchAction } from './addTouchAction.js'

const xY = pos => `${pos.x} ${pos.y}`

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
        // xy1: { pos: { x: 0, y: 0 } },
        // xy2: { pos: { x: 0, y: 0 } },
        xy1: null,
        xy2: null,
        left: null,
        right: null
      },
    }],
    svg: null,
    svgStyle: settings.svgStyle,
    id: settings.idCount
  })
  settings.paths[0].points[0].path = settings.paths[0]
}

const addNode = ({ point }) => {
  const newNode = {
    el: Object.assign(document.createElement('div'), 
    { className: 'node' }),
    path: point.path,
    point,
    // data: point
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

const addCnodeEl = ({ point, isRightNode }) => {
  const key = isRightNode ? 'xy1' : 'xy2'
  const newNode = {
    el: Object.assign(document.createElement('div'), 
    { className: `node c ${isRightNode ? 'right' : 'left'}` }),
    // pos: point.cNode[key].pos,
    path: point.path,
    point: point.cNode[key],
    isRightNode,
    axis: isRightNode ? point.prevPoint.pos : point.pos
    // key: isRightNode ? 'xy1' : 'xy2'
  }
  setStyles(newNode)
  elements.display.append(newNode.el)
  addTouchAction({ node: newNode, point: newNode.point })

  if (isRightNode) {
    point.prevPoint.cNode.right = newNode 
    point.prevPoint.cNode.rightLine = {
      start: point.prevPoint,
      end: newNode.point,
      color: 'red'
    }
  } else {
    point.cNode.left = newNode
    point.cNode.leftLine = {
      start: point,
      end: newNode.point,
      color: 'blue'
    }
  }
}

const addLeftCnode = point => {
  point.letter = 'C'
  point.isCurve = true
  point.cNode.xy1.pos = point.cNode.xy1.pos || point.pos

  point.cNode.xy2.pos = cNodePos({
    currentPos: point.pos,
    prevPos: point.prevPoint?.pos || point.pos,
    nextPos: point.nextPoint?.pos || point.pos,
    reverse: true
  })

  updatePath(point.path)
  addCnodeEl({ point })
}

const addRightCnode = point => {
  point.letter = 'C'
  point.isCurve = true
  point.cNode.xy1.pos = cNodePos({
      currentPos: point.prevPoint.pos || point.nextPoint.pos,
      prevPos: point.prevPoint?.prevPoint?.pos || point.nextPoint.pos,
      nextPos: point.pos || point.nextPoint.pos,
    })
  
  point.cNode.xy2.pos = point.cNode.xy2.pos || point.pos

  updatePath(point.path)
  addCnodeEl({ 
    // data: point.cNode.xy1,
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
