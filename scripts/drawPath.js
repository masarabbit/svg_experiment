function init() {

  const buttons = document.querySelectorAll('.button')
  const indicator = document.querySelector('.indicator')
  const svg = document.querySelector('.svg')
  const display = document.querySelector('.display')
  const textarea = document.querySelector('textarea')
  const smoothing = 0.2


  let pI = 0
  let nI = 0
  const fill = 'none'
  const stroke = 'red'
  const strokeWidth = 2
  let draw = true
  const pathData = [[]]
  const colorData = []
  // const nodeTypes = ['xy', 'xy1', 'xy2']


  const line = (pointA, pointB) => {
    const lengthX = pointB[0] - pointA[0]
    const lengthY = pointB[1] - pointA[1]
    return {
      length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
      angle: Math.atan2(lengthY, lengthX)
    }
  }


  const controlPoint = ({ current, previous, next, reverse }) => {
    const prevPoint = previous || current
    const nextPoint = next || current
    const createdLine = line(prevPoint, nextPoint)
    const lineAngle = createdLine.angle + (reverse ? Math.PI : 0)
    const lineLength = createdLine.length * smoothing

    const x = current[0] + Math.cos(lineAngle) * lineLength || current[0]
    const y = current[1] + Math.sin(lineAngle) * lineLength || current[1]

    return [Math.round(x), Math.round(y)]
  }


  const outputSvgAndNodes = () =>{    
    svg.innerHTML = pathData.map((data, i)=> svgPath(i, data.map(n => n.xy))).join('')
    display.innerHTML = ''
    console.log('output', svg.innerHTML)
  }


  const svgPath = (pI, points) => {
  // console.log('points', points)
    const command = (point, i, arr) => {
      
      // prevI and nextI is different for first and last index
      const { closed, xy1Set, xy2Set } = pathData[pI][i]
      const lastIndex = pathData[pI].length - 1
      const nextI = closed ? 1 : i + 1

      const isLastZ = i === 1 && pathData[pI][lastIndex].letter === 'Z'
      const prevI = isLastZ ? lastIndex - 1 : i - 1 
      const prevPrevI = isLastZ ? lastIndex - 2 : i - 2 
      
      // manually set value || calculated value
      pathData[pI][i].xy1 = xy1Set || controlPoint({
        current: arr[prevI], 
        previous: arr[prevPrevI], 
        next: point
      })
      pathData[pI][i].xy2 = xy2Set || controlPoint({
        current: point, 
        previous: arr[prevI], 
        next: arr[nextI], 
        reverse: true
      })

      const { letter, xy1, xy2, xy } = pathData[pI][i]
      return letter === 'C' 
        ? `${letter} ${xy1[0]},${xy1[1]} ${xy2[0]},${xy2[1]} ${xy[0]},${xy[1]}`
        : `${letter} ${xy[0]},${xy[1]}`
    }


    const d = points.reduce((acc, point, i, arr) => {
      if (!point) return `${acc} Z`
      const coord = i === 0
        ? `M ${point[0]},${point[1]}`
        : `${acc} ${command(point, i, arr)}`
      return coord
    },'')  
    textarea.value = d
  
    const { fill, stroke, strokeWidth } = colorData[pI]
    return `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`
  }

  display.addEventListener('mousemove', e =>{
    const { x: offSetX, y: offSetY } = display.getBoundingClientRect()
    indicator.innerHTML = `x:${e.clientX - offSetX} y:${e.clientY - offSetY}`
  })

  const drawPath = (x, y) => {
      // prep
      pathData[pI].push({})

      // xy id letter xy1 xy2
      pathData[pI][nI] = {
        id: [pI, nI],
        letter: nI === 0 ? 'M' : 'C',
        xy1: [],
        xy2: [],
        // dxyAuto: true, 
        xy: [x, y],
      }
  
      // resets xy2Set if set already
      if (pathData[pI][nI - 1]?.xy2Set) pathData[pI][nI - 1].xy2Set = null
  
      colorData[pI] = {
        fill: fill,
        stroke: stroke,
        strokeWidth: strokeWidth
      }
      
      // prep next  
      outputSvgAndNodes()
      nI++
  }

  const closePath = () =>{
    pathData[pI][nI] = {
      id: [pI, nI],
      letter: 'C',
      // dxyAuto: true,
      closed: true,
      xy: pathData[pI][0].xy,
    }

    // reset xy1Set and xy2Set
    if (pathData[pI][nI - 1]?.xy2Set) pathData[pI][nI - 1].xy2Set = null
    pathData[pI][1].xy1Set = null

    pathData[pI][nI + 1] = {
      id: [pI, nI + 1],
      letter: 'Z',
    }
    outputSvgAndNodes()
    // console.log('pathData', pathData[pI])
    pI++
    nI = 0
    pathData.push([])
    colorData[pI] = {
      fill: fill,
      stroke: stroke,
      strokeWidth: strokeWidth
    }
  }
  
  
  //* throttle this?
  display.addEventListener('click', e =>{
    if (!draw) return
    const { x: offSetX, y: offSetY } = display.getBoundingClientRect()
    drawPath(e.clientX - offSetX, e.clientY - offSetY)
  })

  buttons.forEach( button =>{
    if (button.dataset.c === 'z') button.addEventListener('click', closePath)

    if (button.dataset.c === 'output') button.addEventListener('click', ()=>{
      const coords = document.querySelector('.coords_input').value.split(',').map(xy => xy.split('-'))
      console.log('coords', coords)
      coords.forEach(coord => drawPath(+coord[0], +coord[1]))
      closePath()
    })
  })
}

window.addEventListener('DOMContentLoaded', init)