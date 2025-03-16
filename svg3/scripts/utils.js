
const nearestN = (x, n) => x === 0 ? 0 : (x - 1) + Math.abs(((x - 1) % n) - n)
const isNum = x => typeof x === 'number'
const px = n => `${n}px`

const degToRad = deg => deg / (180 / Math.PI)
const radToDeg = rad => Math.round(rad * (180 / Math.PI))

const kebabToCamelCase = str => {
  return str.split('-').map((word, i) => {
    if (i) return String(word).charAt(0).toUpperCase() + String(word).slice(1)
    return word
  }).join('')
}

const camelCaseToNormalString = str => {
  return str.split('').map(letter => {
    return (letter === letter.toUpperCase() || isNum(letter)) ?  ` ${letter.toLowerCase()}` : letter
  }).join('')
}

const distanceBetween = (a, b) => Math.round(Math.sqrt(Math.pow((a.x - b.x), 2) + Math.pow((a.y - b.y), 2)))

const mouse = {
  addEvents(target, event, action, array) {
    array.forEach(a => target[`${event}EventListener`](a, action, { passive: false } ))
  },
  up(t, e, a) { this.addEvents(t, e, a, ['mouseup', 'touchend']) },
  move(t, e, a) { this.addEvents(t, e, a, ['mousemove', 'touchmove']) },
  down(t, e, a) { this.addEvents(t, e, a, ['mousedown', 'touchstart']) },
  enter(t, e, a) { this.addEvents(t, e, a, ['mouseenter', 'touchstart']) },
  leave(t, e, a) { this.addEvents(t, e, a, ['mouseleave', 'touchmove']) }
}

const roundedClient = (e, type) => Math.round(e.type[0] === 'm' ? e[`client${type}`] : e.touches[0][`client${type}`])

const xY = pos => `${pos.x} ${pos.y}`

const rgbToHex = (r, g, b) => {
  if (r > 255 || g > 255 || b > 255)
    throw 'Invalid color component'  
  return ((r << 16) | (g << 8) | b).toString(16)
}

const hex = rgb => '#' + ('000000' + rgb).slice(-6)

export {
  nearestN,
  isNum,
  px,
  camelCaseToNormalString,
  mouse,
  roundedClient,
  xY,
  degToRad,
  radToDeg,
  distanceBetween,
  kebabToCamelCase,
  hex,
  rgbToHex
}