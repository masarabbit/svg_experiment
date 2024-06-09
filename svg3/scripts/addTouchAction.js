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

// const addMarker = ({ x, y }) => {
//   const marker = {
//     el: Object.assign(document.createElement('div'), { className: 'c node' }),
//     pos: { x, y }
//   }
//   elements.display.append(marker.el)
//   setStyles(marker)
// }


// TODO need to test logic to set default cNode pos

const addCnodeEl = ({ pos, path, point, data, isRightNode }) => {
  const newNode = {
    el: Object.assign(document.createElement('div'), 
    { className: `node c ${isRightNode ? 'next' : 'prev'}` }),
    pos,
    path,
    point,
    isRightNode,
  }
  // TODO this bit isn't right
  if (isRightNode) {
 
    // point.cNode.next.node = newNode
  } 
  // else {
  //   point.nextPoint.cNode.prev.node = newNode
  // }
  data.node = newNode

  console.log('test 1', point.cNode[isRightNode ? 'next' : 'prev'])
  setStyles(newNode)
  elements.display.append(newNode.el)
  addTouchAction({ node: newNode, isRightNode, data })
}

const addCnode = (point, isRightNode) => {
  point.letter = 'C'
  point.isCurve = true
  point.cNode.prev.pos = isRightNode 
    ? controlPoint({
      currentPos: point.prevPoint.pos || point.pos,
      prevPos: point.prevPoint?.prevPoint?.pos || point.pos,
      nextPos: point.pos,
    })
    : point.prevPoint?.pos || point.pos

  point.cNode.prev.point = point

  point.cNode.next.pos = isRightNode
    ? point.pos
    : controlPoint({
      currentPos: point.pos,
      prevPos: point.prevPoint?.pos || point.pos,
      nextPos: point.nextPoint?.pos || point.pos,
      reverse: true
    })

  point.cNode.next.point = point.prevPoint || point


  updatePath(point.path)

  addCnodeEl(
    isRightNode
      ? { 
          pos: point.cNode.prev.pos,
          path: point.path,
          point,
          data: point.cNode.prev,
          isRightNode,
        }
      : {
          pos: point.cNode.next.pos,
          path: point.path,
          point,
          data: point.cNode.next,
        } 
  )
}

const addTouchAction = ({ node, isRightNode, data }) =>{
  const onGrab = () =>{
    mouse.up(document, 'add', onLetGo)
    mouse.move(document, 'add', onDrag)
    if (!data && settings.drawMode === 'curve' && node.point.letter !== 'C') {
      if (node.point.letter !== 'M') addCnode(node.point)
      if (node.point.nextPoint) addCnode(node.point.nextPoint, true)
    }
  }
  const onDrag = e =>{
    const { left, top } = elements.display.getBoundingClientRect()
    const pos = {
      x: roundedClient(e, 'X') - left,
      y: roundedClient(e, 'Y') - top
    }
    if (data) {
      ;[data, node].forEach(item => item.pos = pos)
    } else {
      const diff = {
        x: pos.x - node.point.pos.x,
        y: pos.y - node.point.pos.y
      }
      ;[node.point, node].forEach(item => item.pos = pos)
      if (node.point.letter === 'C') {
        console.log('test 2', 
          node.point.cNode.next.node,
          node.point.cNode.prev.node
        )
        if (node.point.cNode.next.node) {
          node.point.cNode.next.pos.x += diff.x
          node.point.cNode.next.pos.y += diff.y
          setStyles(node.point.cNode.next.node)
        }

        if (node.point.nextPoint.cNode.prev.node) {
          node.point.nextPoint.cNode.prev.pos.x += diff.x
          node.point.nextPoint.cNode.prev.pos.y += diff.y
          setStyles(node.point.nextPoint.cNode.prev.node)
        }
      }
    }
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