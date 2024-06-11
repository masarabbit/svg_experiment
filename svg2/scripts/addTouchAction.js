import { setStyles, client, addEvents } from './utils.js'
import { settings, elements } from './settings.js'
import { updatePath, addLeftCnode, addRightCnode, addPath } from './pathAction.js'

const roundedClient = (e, type) => Math.round(client(e, type))

const mouse = {
  up: (el, e, a) => addEvents(el, e, a, ['mouseup', 'touchend']),
  move: (el, e, a) => addEvents(el, e, a, ['mousemove', 'touchmove']),
  down: (el, e, a) => addEvents(el, e, a, ['mousedown', 'touchstart']),
  enter: (el, e, a) => addEvents(el, e, a, ['mouseenter', 'touchstart']),
  leave: (el, e, a) => addEvents(el, e, a, ['mouseleave'])
}

// const addMarker = ({ x, y }) => {
//   const marker = {
//     el: Object.assign(document.createElement('div'), { className: 'c node' }),
//     pos: { x, y }
//   }
//   elements.display.append(marker.el)
//   setStyles(marker)
// }


const applyDiff = ({ pos, diff }) => {
  pos.x += diff.x
  pos.y += diff.y
}

const cNodeLineHtml = lineData => {
  const { color, start, end } = lineData
  return `<line stroke="${color}" stroke-width="1" x1="${start.pos.x}" y1="${start.pos.y}" x2="${end.pos.x}" y2="${end.pos.y}"/>`
}

const updateLines = path => {
  elements.lineOutput.innerHTML = `<svg class="line" width="100%" height="100%" fill="transparent">
  ${path.points.map(p => {
    const leftLine = p.cNode.leftLine 
      ? cNodeLineHtml(p.cNode.leftLine)
      : ''
    const rightLine = p.cNode.rightLine 
      ? cNodeLineHtml(p.cNode.rightLine)
      : ''
    return leftLine + rightLine
  }).join('')}
</svg>`
}

const degToRad = deg => deg / (180 / Math.PI)
const radToDeg = rad => Math.round(rad * (180 / Math.PI))
const angleTo = ({ a, b }) => Math.atan2(b.y - a.y, b.x - a.x)

const rotateCoord = ({ angle, origin, pos }) =>{
  const a = angle
  const aX = pos.x - origin.x
  const aY = pos.y - origin.y
  return {
    x: (aX * Math.cos(a)) - (aY * Math.sin(a)) + origin.x,
    y: (aX * Math.sin(a)) + (aY * Math.cos(a)) + origin.y,
  }
}

const getOffsetPos = ({ pos, distance, angle }) => {
  return {
    x: pos.x + (distance * Math.cos(degToRad(angle - 90))),
    y: pos.y + (distance * Math.sin(degToRad(angle - 90)))
  }
}

const addTouchAction = ({ node, data }) =>{
  const onGrab = () =>{
    mouse.up(document, 'add', onLetGo)
    mouse.move(document, 'add', onDrag)
    if (!data && settings.drawMode === 'curve' && node.point.letter !== 'C') {
      //* add cNodes
      if (node.point.letter !== 'M') addLeftCnode(node.point)
      if (node.point.nextPoint) addRightCnode(node.point.nextPoint)
      if (node.point.cNode.left) node.point.cNode.left.pair = node.point.cNode.right
      if (node.point.cNode.right) node.point.cNode.right.pair = node.point.cNode.left

      updateLines(node.path)
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
      const axis = node.isRightNode ? node.point.prevPoint.pos : node.point.pos
      const newPos = getOffsetPos({
        angle: radToDeg(angleTo({
          a: axis,
          b: node.pos,
        })),
        pos: node.pair.pos,
        distance: 1,
      })

      // const diff = {
      //   x: axis.x - pos.x,
      //   y: axis.y - pos.y
      // }
      // node.pair.pos.x = axis.x + diff.x
      // node.pair.pos.y = axis.y + diff.y
      node.pair.pos.x = newPos.x
      node.pair.pos.y = newPos.y
      setStyles(node.pair)

      // TODO instead of mirroring position, need to just mirror angle
      // * current code doesn't return the correct coord (angle seems to be off)
      // console.log(diff)
    } else {
      //* move cNode pairs when main node is moved
      const diff = {
        x: pos.x - node.point.pos.x,
        y: pos.y - node.point.pos.y
      }
      ;[node.point, node].forEach(item => item.pos = pos)
      if (node.point.letter === 'C') {
        if (node.point.cNode.left) {
          applyDiff({ pos: node.point.cNode.left.pos, diff })
          setStyles(node.point.cNode.left)
        }
        if (node.point.cNode.right) {
          applyDiff({ pos: node.point.cNode.right.pos, diff })
          setStyles(node.point.cNode.right)
        }
      }
    }
    setStyles(node)
    updateLines(node.path)
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