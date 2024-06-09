import { setStyles, client, addEvents } from './utils.js'
import { settings, elements } from './settings.js'
import { updatePath } from './pathAction.js'

const roundedClient = (e, type) => Math.round(client(e, type))

const mouse = {
  up: (el, e, a) => addEvents(el, e, a, ['mouseup', 'touchend']),
  move: (el, e, a) => addEvents(el, e, a, ['mousemove', 'touchmove']),
  down: (el, e, a) => addEvents(el, e, a, ['mousedown', 'touchstart']),
  enter: (el, e, a) => addEvents(el, e, a, ['mouseenter', 'touchstart']),
  leave: (el, e, a) => addEvents(el, e, a, ['mouseleave'])
}

const line = (pointA, pointB) => {
  const lengthX = pointB.x - pointA.x
  const lengthY = pointB.y - pointA.y
  return {
    length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
    angle: Math.atan2(lengthY, lengthX)
  }
}

const controlPoint = ({ currentPos, prevPos, nextPos, reverse }) => {
  const prevPoint = prevPos || currentPos
  const nextPoint = nextPos || currentPos
  const createdLine = line(prevPoint, nextPoint)
  const lineAngle = createdLine.angle + (reverse ? Math.PI : 0)
  const lineLength = createdLine.length * settings.svgStyle.smoothing

  const x = currentPos.x + Math.cos(lineAngle) * lineLength || currentPos.x
  const y = currentPos.y + Math.sin(lineAngle) * lineLength || currentPos.y

  return { 
    x: Math.round(x), 
    y: Math.round(y) 
  }
}


const addMarker = ({ x, y }) => {
  const marker = {
    el: Object.assign(document.createElement('div'), { className: 'c node' }),
    pos: { x, y }
  }
  elements.display.append(marker.el)
  setStyles(marker)
}

// pathData[pI][i].xy1 = xy1Set || controlPoint({
//   current: arr[prevI], 
//   previous: arr[prevPrevI], 
//   next: point
// })
// pathData[pI][i].xy2 = xy2Set || controlPoint({
//   current: point, 
//   previous: arr[prevI], 
//   next: arr[nextI], 
//   reverse: true
// })


// My old one
// pathData[pI][currentI].letter = 'C'
// pathData[pI][currentI].x1 = pathData[pI][currentI].x1 || pathData[pI][prevI].x
// pathData[pI][currentI].y1 = pathData[pI][currentI].y1 || pathData[pI][prevI].y
// pathData[pI][currentI].x2 = pathData[pI][currentI].x2 || x - 10
// pathData[pI][currentI].y2 =  pathData[pI][currentI].y2 || y - 10

// pathData[pI][nextI].letter = 'C'
// pathData[pI][nextI].x2 = pathData[pI][nextI].x2 || pathData[pI][nextI].x + 10
// pathData[pI][nextI].y2 = pathData[pI][nextI].y2 || pathData[pI][nextI].y + 10
// pathData[pI][nextI].x1 = pathData[pI][nextI].x1 || x + 10
// pathData[pI][nextI].y1 = pathData[pI][nextI].y1 || y + 10

// TODO need to test logic to set default cNode pos

const addCnode = (point, isRightNode) => {
  point.letter = 'C'
  point.isCurve = true
  point.cNode.prev.pos = isRightNode 
    ? controlPoint({
      currentPos: point.prevPoint.pos,
      prevPos: point.prevPoint.prevPoint.pos,
      nextPos: point.pos,
    })
    : point.prevPoint.pos
  // point.cNode.prev.pos.isSet = true

  point.cNode.next.pos = isRightNode
    ? point.pos
    : controlPoint({
      currentPos: point.pos,
      prevPos: point.prevPoint.pos,
      nextPos: point.nextPoint.pos,
      reverse: true
    })
  // point.cNode.next.pos.isSet = true
  updatePath(point.path)
  isRightNode
    ? addMarker(point.cNode.prev.pos)
    : addMarker(point.cNode.next.pos)
}

const addTouchAction = node =>{
  const onGrab = () =>{
    mouse.up(document, 'add', onLetGo)
    mouse.move(document, 'add', onDrag)
    if (settings.drawMode === 'curve') {
      addCnode(node.point)
      addCnode(node.point.nextPoint, true)
    }
  }
  const onDrag = e =>{
    const { left, top } = elements.display.getBoundingClientRect()
    const pos = {
      x: roundedClient(e, 'X') - left,
      y: roundedClient(e, 'Y') - top
    }
    ;[node.point, node].forEach(item => item.pos = pos)
    setStyles(node)
    updatePath(node.path)
  }
  const onLetGo = () => {
    mouse.up(document, 'remove', onLetGo)
    mouse.move(document,'remove', onDrag)

  }
  mouse.down(node.el,'add', onGrab)
  mouse.enter(node.el,'add', ()=> {
    if (settings.drawMode === 'curve') return
    settings.prevDrawMode = settings.drawMode
    settings.drawMode = 'drag'
  })
  mouse.leave(node.el,'add', ()=> {
    if (settings.drawMode === 'curve') return
    settings.drawMode = settings.prevDrawMode
  })
}

export {
  addTouchAction
}