
const nearestN = (x, n) => x === 0 ? 0 : (x - 1) + Math.abs(((x - 1) % n) - n)
const isNum = x => typeof x === 'number'
const px = n => `${n}px`

const convertCameCase = string => {
  return string.split('').map(letter => {
    return (letter === letter.toUpperCase() || isNum(letter)) ?  ` ${letter.toLowerCase()}` : letter
  }).join('')
}

const mouse = {
  addEvents(target, event, action, array) {
    array.forEach(a => target[`${event}EventListener`](a, action))
  },
  up(t, e, a) { this.addEvents(t, e, a, ['mouseup', 'touchend']) },
  move(t, e, a) { this.addEvents(t, e, a, ['mousemove', 'touchmove']) },
  down(t, e, a) { this.addEvents(t, e, a, ['mousedown', 'touchstart']) },
  enter(t, e, a) { this.addEvents(t, e, a, ['mouseenter', 'touchstart']) },
  leave(t, e, a) { this.addEvents(t, e, a, ['mouseleave', 'touchmove']) }
}

const roundedClient = (e, type) => Math.round(e.type[0] === 'm' ? e[`client${type}`] : e.touches[0][`client${type}`])


export {
  nearestN,
  isNum,
  px,
  convertCameCase,
  mouse,
  roundedClient
}