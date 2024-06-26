
const px = num => `${num}px`

const setStyles = ({ el, pos, w, h, deg, point }) =>{
  if (w) el.style.width = px(w)
  if (h) el.style.height = px(h)
  const x = point?.pos.x || pos?.x || 0
  const y = point?.pos.y || pos?.y || 0 
  el.style.transform = `translate(${px(x)}, ${px(y)}) rotate(${deg || 0}deg)`
}

const client = (e, type) => e.type[0] === 'm' ? e[`client${type}`] : e.touches[0][`client${type}`]
const addEvents = (el, event, action, array) => {
  array.forEach(a => event === 'remove' ? el.removeEventListener(a, action) : el.addEventListener(a, action))
}

const newElement = html => {
  const containerDiv = document.createElement('div')
  containerDiv.innerHTML = html
  return containerDiv.firstChild
}

const distanceBetween = (a, b) => Math.round(Math.sqrt(Math.pow((a.x - b.x), 2) + Math.pow((a.y - b.y), 2)))

// const addMarker = ({ x, y }) => {
//   const marker = {
//     el: Object.assign(document.createElement('div'), { className: 'c node' }),
//     pos: { x, y }
//   }
//   elements.display.append(marker.el)
//   setStyles(marker)
// }

export {
  px,
  setStyles,
  client,
  addEvents,
  newElement,
  distanceBetween,
}