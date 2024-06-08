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

const addTouchAction = node =>{
  const onGrab = () =>{
    mouse.up(document, 'add', onLetGo)
    mouse.move(document, 'add', onDrag)
    if (settings.drawMode === 'curve') {
      node.point.isCurve = true

      // TODO
      // addCurve(node)
      //  const { letter, xy1, xy2, xy } = pathData[pI][i]
      // return letter === 'C' 
      // ? `${letter} ${xy1[0]},${xy1[1]} ${xy2[0]},${xy2[1]} ${xy[0]},${xy[1]}`
      // : `${letter} ${xy[0]},${xy[1]}`
    }
  }
  const onDrag = e =>{
    const { left, top } = elements.display.getBoundingClientRect()
    const pos = {
      x: roundedClient(e, 'X') - left,
      y: roundedClient(e, 'Y') - top
    }
    node.point.pos = pos
    node.pos = pos
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