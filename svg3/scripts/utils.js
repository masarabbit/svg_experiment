
const px = num => `${num}px`

const setStyles = ({ el, pos, w, h, deg }) =>{
  if (w) el.style.width = px(w)
  if (h) el.style.height = px(h)
  el.style.transform = `translate(${pos.x ? px(pos.x) : 0}, ${pos.y ? px(pos.y) : 0}) rotate(${deg || 0}deg)`
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

export {
  px,
  setStyles,
  client,
  addEvents,
  newElement
}