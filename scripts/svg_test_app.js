function init() {
  
  // adapted from ref below
  //ref https://codepen.io/francoisromain/pen/dzoZZj?editors=0010

  const indicator = document.querySelector('.indicator')
  const svg = document.querySelector('.svg')
  const display = document.querySelector('.display')
  const textarea = document.querySelector('textarea')
  const smoothing = 0.2

  //* maybe this should be object?
  //* record letter etc
  const points = [
  [5, 10],
  // [10, 40],
  // [40, 30],
  ]

  let pI = 0
  let nI = 0
  let fill = 'none'
  let stroke = 'red'
  let strokeWidth = 3
  let draw = true
  let selectedNode 
  const pathData = [[]]
  const colorData = []
  // const pointData = [[]]
  const nodeTypes = ['xy', 'dxy1', 'dxy2']



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


  const leftLine = (xy, dxy2) =>{
    return `<line stroke="red" x1="${xy[0]}" y1="${xy[1]}" x2="${dxy2[0]}" y2="${dxy2[1]}"/>` 
  }

  const rightLine = (xy, nextDxy1) =>{
    return `<line stroke="blue" x1="${nextDxy1[0]}" y1="${nextDxy1[1]}" x2="${xy[0]}" y2="${xy[1]}"/>`
  }

  const svgHandleLine = pI =>{
    const pointData = pathData[pI].map(n=>{
      return [n.xy, n.dxy1, n.dxy2]
    })
    return pointData.map((n,i)=>{
      const L = !n[1][0] ? '' : leftLine(n[0],n[2])
      const R = !pointData[i + 1] ? '' : rightLine(n[0],pointData[i + 1][1])
      return L + R
    }).join('')
  } 
  
  const outputSvgAndHandles = pI =>{
    // todo may need to do forEach here to loop through svgPath, currently only does 1 svg.
    
    svg.innerHTML = svgPath(pathData[pI].map(n=>n.xy)) + svgHandleLine(pI)
    display.innerHTML = ''
    nodeTypes.forEach(nodeType=>{
      pathData[pI].map(n=>n[nodeType]).forEach((p,i)=>{
        if(!p[0]) return
        addNode(p[0],p[1],i,nodeType)
      })
    })
  }

  const addNode = (x,y,nI,nodeType) =>{
    const node = document.createElement('div')
    node.classList.add('node')
    node.classList.add(nodeType)
    if (`${pI}-${nI}` === selectedNode) node.classList.add('selected')
    node.style.left = `${x}px`
    node.style.top = `${y}px`  
    node.dataset.pI = `${pI}`
    node.dataset.nI = `${nI}` //todo change this
    display.appendChild(node)

    const onDrag = e => {
      const { x:offSetX, y:offSetY } = display.getBoundingClientRect()
      const newX = e.clientX - offSetX
      const newY = e.clientY - offSetY
      node.style.left = `${newX}px`
      node.style.top = `${newY}px`
      const pI = +node.dataset.pI
      const nI = +node.dataset.nI
      selectedNode = `${pI}-${nI}`
      
      pathData[pI].map(n=>n[nodeType])[nI] = [newX, newY]
      if(nodeType === 'xy') { 
        pathData[pI][nI][nodeType] = [newX, newY] 
      } else {
        pathData[pI][nI][nodeType + 'Set'] = [newX, newY]
      }
      outputSvgAndHandles(pI)
    }

    const onLetGo = () => {
      document.removeEventListener('mousemove', onDrag)
      document.removeEventListener('mouseup', onLetGo)
      // svg.innerHTML = svgPath(pointData[pI])
    } 
    const onGrab = () => {
      document.addEventListener('mousemove', onDrag)
      document.addEventListener('mouseup', onLetGo)
    }
    
    node.addEventListener('mouseenter',()=>draw = false)
    node.addEventListener('mouseleave',()=>draw = true)
    node.addEventListener('mousedown', onGrab)

    node.addEventListener('click', ()=>{
      indicator.innerHTML = `${nodeType}-${pI}-${nI}`
    })

  }


  const svgPath = points => {
  // console.log('points', points)
    const command = (point, i, arr) => {
      //TODO make below defaults ? if already defined, shouldn't enter?
      pathData[pI][i].dxy1 = pathData[pI][i].dxy1Set || controlPoint(arr[i - 1], arr[i - 2], point, false)
      pathData[pI][i].dxy2 = pathData[pI][i].dxy2Set || controlPoint(point, arr[i - 1], arr[i + 1], true)

      const { letter, dxy1, dxy2, xy } = pathData[pI][i]
      return pathData[pI][i].letter === 'C' 
        ? `${letter} ${dxy1[0]},${dxy1[1]} ${dxy2[0]},${dxy2[1]} ${xy[0]},${xy[1]}`
        : `${letter} ${xy[0]},${xy[1]}`
    }

    const d = points.reduce((acc, point, i, arr) => {
      // if (i !== 0) console.log('command_within', command(point, i, arr))
      const coord = i === 0
      ? `M ${point[0]},${point[1]}`
      : `${acc} ${command(point, i, arr)}`
      return coord
    },'')  
  textarea.value = d

  return `<path d="${d}" fill="${colorData[pI].fill}" stroke="${colorData[pI].stroke}" stroke-width="${colorData[pI].strokeWidth}" />`
  }


  // const path = (d, fill, stroke) =>{
  //   return `<path d="${d}" fill="${fill}" stroke="${stroke}" />`
  // }


  display.addEventListener('mousemove',(e)=>{
    const { x:offSetX, y:offSetY } = display.getBoundingClientRect()
    indicator.innerHTML = `x:${e.clientX - offSetX} y:${e.clientY - offSetY}`
  })
  
  
  //* throttle this?
  display.addEventListener('click', (e)=>{
    if (!draw) return
    const { x:offSetX, y:offSetY } = display.getBoundingClientRect()

    //* prep
    pathData[pI].push({})
    // const newPath = pathData[pI][nI]

    //* xy id letter dxy1 dxy2
    pathData[pI][nI] = {
      id: [pI, nI],
      letter: nI === 0 ? 'M' : 'C',
      dxy1: [],
      dxy2: [],
      xy: [e.clientX - offSetX, e.clientY - offSetY],
    }

    // pointData[pI][nI] = pathData[pI][nI].xy
    colorData[pI] = {
      fill: fill,
      stroke: stroke,
      strokeWidth: strokeWidth
    }
    
    //* prep next  
    outputSvgAndHandles(pI)
    nI++
    // console.log('svgHandleLine', svgHandleLine(pI))
  })
}

window.addEventListener('DOMContentLoaded', init)