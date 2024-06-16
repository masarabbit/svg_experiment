const degToRad = deg => deg / (180 / Math.PI)
const radToDeg = rad => Math.round(rad * (180 / Math.PI))
const angleTo = ({ a, b }) => Math.atan2(b.y - a.y, b.x - a.x)

const getOffsetPos = ({ pos, distance, angle }) => {
  return {
    x: Math.round(pos.x + (distance * Math.cos(degToRad(angle)))),
    y: Math.round(pos.y + (distance * Math.sin(degToRad(angle))))
  }
}

// const rotateCoord = ({ angle, origin, pos }) =>{
//   const a = angle
//   const aX = pos.x - origin.x
//   const aY = pos.y - origin.y
//   return {
//     x: (aX * Math.cos(a)) - (aY * Math.sin(a)) + origin.x,
//     y: (aX * Math.sin(a)) + (aY * Math.cos(a)) + origin.y,
//   }
// }


export {
  getOffsetPos,
  radToDeg,
  angleTo
}