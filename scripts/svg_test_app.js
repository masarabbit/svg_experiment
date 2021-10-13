function init() {
  
  // adapted from ref below
  //ref https://codepen.io/francoisromain/pen/dzoZZj?editors=0010

  const indicator = document.querySelector('.indicator')
  const svg = document.querySelector('.svg')
  const display = document.querySelector('.display')
  const { x:offSetX, y:offSetY } = display.getBoundingClientRect()
  const textarea = document.querySelector('textarea')
  const smoothing = 0.2

  //* maybe this should be object?
  //* record letter etc
  const points = [
  [5, 10],
  // [10, 40],
  // [40, 30],
  // [60, 5],
  // [90, 45],
  // [120, 10],
  // [150, 45],
  // [200, 10]
  ]

  let pI = 0
  let nI = 0
  let fill = 'none'
  let stroke = 'red'
  let strokeWidth = 3
  const pathData = [[]]
  const colorData = []
  const pointData = [[]]


  const line = (pointA, pointB) => {
    const lengthX = pointB[0] - pointA[0]
    const lengthY = pointB[1] - pointA[1]
    return {
      length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
      angle: Math.atan2(lengthY, lengthX)
    }
  }


  const controlPoint = (current, previous, next, reverse) => {
    const prevPoint = previous || current
    const nextPoint = next || current
    const createdLine = line(prevPoint, nextPoint)
    const lineAngle = createdLine.angle + (reverse ? Math.PI : 0)
    const lineLength = createdLine.length * smoothing

    const x = current[0] + Math.cos(lineAngle) * lineLength || current[0]
    const y = current[1] + Math.sin(lineAngle) * lineLength || current[1]

    //TODO roundup x and y?
  return [Math.round(x), Math.round(y)]
  }

  const addCnode = (x,y) =>{
    const cNode = document.createElement('div')
    cNode.classList.add('cNode')
    cNode.style.left = `${x}px`
    cNode.style.top = `${y}px`  
    display.appendChild(cNode)
  }

  // const addHandle = (x,y) =>{
  // }


  const svgPath = points => {
  // console.log('points', points)

    const command = (point, i, arr) => {
      // console.log('point', point)
      //TODO make below defaults ?
      pathData[pI][i].dxy1 = controlPoint(arr[i - 1], arr[i - 2], point, false)
      pathData[pI][i].dxy2 = controlPoint(point, arr[i - 1], arr[i + 1], true) //? need next point to be able to work this out

      // return `C ${dxy1[0]},${dxy1[1]} ${dxy2[0]},${dxy2[1]} ${point[0]},${point[1]}`
      // return `L ${point[0]},${point[1]}`

      const { letter, dxy1, dxy2, xy } = pathData[pI][i]
      return pointData[pI][nI] = letter === 'C' 
        ? `${letter} ${dxy1[0]},${dxy1[1]} ${dxy2[0]},${dxy2[1]} ${xy[0]},${xy[1]}`
        : `${letter} ${xy[0]},${xy[1]}`
    }

    const coords = []
    const d = points.reduce((acc, point, i, arr) => {
      // console.log('arr', arr)
      // console.log('point', point)
      // console.log('point', points[i])
      if (i !== 0) console.log('command_within', command(point, i, arr))
      
      const coord = i === 0
      ? `M ${point[0]},${point[1]}`
      : `${acc} ${command(point, i, arr)}`
      
      coords.push(coord)
      addCnode(points[i][0], points[i][1]) //todo how to return coords? where does 3 come from?
      return coord
    }
  , '')
  
  textarea.value = d

  console.log('path', `<path d="${d}" fill="${fill}" stroke="${stroke}" />`)
  return `<path d="${d}" fill="${colorData[pI].fill}" stroke="${colorData[pI].stroke}" stroke-width="${colorData[pI].strokeWidth}" />`
  }


  const path = (d, fill, stroke) =>{
    return `<path d="${d}" fill="${fill}" stroke="${stroke}" />`
  }

  // svg.innerHTML = svgPath(points)

  display.addEventListener('mousemove',(e)=>{
    indicator.innerHTML = `x:${e.clientX - offSetX} y:${e.clientY - offSetY}`
  })
  
  //* throttle this?
  display.addEventListener('click', (e)=>{
    //* prep
    pathData[pI].push({})
    // const newPath = pathData[pI][nI]
    
    //* xy id letter dxy1 dxy2
    // newPath.id = [pI, nI]
    // newPath.letter = nI === 0 ? 'M' : 'L'
    // newPath.dxy1 = []
    // newPath.dxy2 = []
    // newPath.xy = [e.clientX - offSetX, e.clientY - offSetY]
    pathData[pI][nI] = {
      id: [pI, nI],
      letter: nI === 0 ? 'M' : 'C',
      dxy1: [],
      dxy2: [],
      xy: [e.clientX - offSetX, e.clientY - offSetY],
    }
    
    pointData[pI][nI] = pathData[pI][nI].xy
    colorData[pI] = {
      fill: fill,
      stroke: stroke,
      strokeWidth: strokeWidth
    }
    
    //* prep next  
    nI++
    console.log('pathData', pathData, 'pointData', pointData)
    svg.innerHTML = svgPath(pointData[pI])
  })
}

window.addEventListener('DOMContentLoaded', init)