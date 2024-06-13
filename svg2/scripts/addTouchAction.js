import { setStyles, client, addEvents, distanceBetween,  } from './utils.js'
import { getOffsetPos, radToDeg, angleTo } from './angleUtils.js'
import { settings, elements } from './settings.js'
import { updatePath, addLeftCnode, addRightCnode } from './pathAction.js'

const roundedClient = (e, type) => Math.round(client(e, type))

const mouse = {
  up: (el, e, a) => addEvents(el, e, a, ['mouseup', 'touchend']),
  move: (el, e, a) => addEvents(el, e, a, ['mousemove', 'touchmove']),
  down: (el, e, a) => addEvents(el, e, a, ['mousedown', 'touchstart']),
  enter: (el, e, a) => addEvents(el, e, a, ['mouseenter', 'touchstart']),
  leave: (el, e, a) => addEvents(el, e, a, ['mouseleave'])
}


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


const addTouchAction = ({ node, data }) =>{
  const onGrab = () =>{
    mouse.up(document, 'add', onLetGo)
    mouse.move(document, 'add', onDrag)
    if (!data && settings.drawMode === 'curve' && !node.point.cNode.left && !node.point.cNode.right) {
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
      if (node.pair) {
        //* move cNode pair based on cNode position
        const axis = node.isRightNode ? node.point.prevPoint.pos : node.point.pos
        ;[
          // node.pair.data,
          node.pair].forEach(item => {
          item.pos = getOffsetPos({
            angle: radToDeg(angleTo({
              a: axis,
              b: node.pos,
            })) + 180,
            pos: axis,
            distance: distanceBetween(axis, node.pair.pos),
          })
        })
        setStyles(node.pair)
      }
    } else {
      //* move cNode pairs when main node is moved
      const diff = {
        x: pos.x - node.point.pos.x,
        y: pos.y - node.point.pos.y
      }
  
      ;[
        node.point, 
        node
      ].forEach(item => item.pos = pos)
      console.log(node.point.pos, node.pos)

      // TODO this bit isn't quite right - the movement of cNode and corresponding coord is not in sync

      if (node.point.letter === 'C') {
        if (node.point.cNode.left) {
          ;[
            node.point.cNode.left
            // , node.point.cNode.left.data
          ].forEach(item => {
            applyDiff({ pos: item.pos, diff })
          })
          setStyles(node.point.cNode.left)
        }
        if (node.point.cNode.right) {
          ;[node.point.cNode.right
            // , node.point.cNode.right.data
          ].forEach(item => {
            applyDiff({ pos: item.pos, diff })
          })
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