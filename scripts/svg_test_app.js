function init() {
  
  // adapted from ref below
  //ref https://codepen.io/francoisromain/pen/dzoZZj?editors=0010

  // todo node could be in different plane, or classes on 'display' could trigger appearance of node
  // eg: display.hideNode .node { opacity: 0 } + only visible on hover

  // delete node / remove node (nodes needs to be relabelled accordingly)
  // close path (check what the svg looks like in illustrator)

  const indicator = document.querySelector('.indicator')
  const svg = document.querySelector('.svg')
  const display = document.querySelector('.display')
  const textarea = document.querySelector('textarea')
  const smoothing = 0.2

  //* maybe this should be object?
  //* record letter etc
  // const points = [
  //   [5, 10]
  //   [10, 40],
  //   [40, 30],
  // ]

  const pI = 0
  let nI = 0
  const fill = 'none'
  const stroke = 'red'
  const strokeWidth = 3
  let draw = true
  let selectedNode 
  const pathData = [[]]
  const colorData = []
  // const pointData = [[]]
  const nodeTypes = ['xy', 'xy1', 'xy2']



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



  const nodeLine = (xy, nextXy1, color) =>{
    return `<line stroke="${color}" x1="${nextXy1[0]}" y1="${nextXy1[1]}" x2="${xy[0]}" y2="${xy[1]}"/>`
  }

  const nodeLines = pI =>{
    const pointData = pathData[pI].map(n=>{
      return { xy: n.xy, xy1: n.xy1, xy2: n.xy2 }
    })
    return pointData.map((n,i)=>{
      const leftLine = n.xy1[0] ? nodeLine(n.xy,n.xy2,'red') : ''
      const rightLine = pointData[i + 1] ? nodeLine(n.xy,pointData[i + 1].xy1,'blue') : ''
      return leftLine + rightLine
    }).join('')
  } 
  
  const outputSvgAndNodes = pI =>{
    // todo may need to do forEach here to loop through svgPath, currently only does 1 svg.
    
    svg.innerHTML = svgPath(pathData[pI].map(n=>n.xy)) + nodeLines(pI)
    display.innerHTML = ''
    nodeTypes.forEach(nodeType=>{
      pathData[pI].map(n=>n[nodeType]).forEach((p,i)=>{
        if (!p[0]) return
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
      const { x: offSetX, y: offSetY } = display.getBoundingClientRect()
      const newX = e.clientX - offSetX
      const newY = e.clientY - offSetY
      node.style.left = `${newX}px`
      node.style.top = `${newY}px`
      const pI = +node.dataset.pI
      const nI = +node.dataset.nI
      selectedNode = `${pI}-${nI}`
      
      // returns how much the node has moved, 
      // so that related nodes could be moved accordingly
      const prev = pathData[pI][nI][nodeType]
      const xDiff = prev[0] - newX
      const yDiff = prev[1] - newY
      
      if (nodeType === 'xy') { 
        pathData[pI][nI][nodeType] = [newX, newY]
        
        // moves xy1 and xy2 if applicable 
        if (pathData[pI][nI + 1] && pathData[pI][nI + 1].xy1Set) {
          const { xy1Set: xy } = pathData[pI][nI + 1]
          pathData[pI][nI + 1].xy1Set = [ xy[0] - xDiff, xy[1] - yDiff]
        }
        if (pathData[pI][nI] && pathData[pI][nI].xy2Set) {
          const { xy2Set: xy } = pathData[pI][nI]
          pathData[pI][nI].xy2Set = [ xy[0] - xDiff, xy[1] - yDiff]
        } 
      } else {
        pathData[pI][nI][nodeType + 'Set'] = [newX, newY]
        const isNodePaired = pathData[pI][nI].dxyAuto
  
        // if xy1 was moved, move xy2 accordingly
        if (nodeType === 'xy1' && pathData[pI][nI - 1] && isNodePaired) {
          const { xy2 } = pathData[pI][nI - 1]
          pathData[pI][nI - 1].xy2Set = [ xy2[0] + xDiff, xy2[1] + yDiff]
        
        // if xy2 was moved, move xy1 accordingly
        } else if (nodeType === 'xy2' && pathData[pI][nI + 1] && isNodePaired) {
          const { xy1 } = pathData[pI][nI + 1]
          pathData[pI][nI + 1].xy1Set = [ xy1[0] + xDiff, xy1[1] + yDiff]
        }
      }
      outputSvgAndNodes(pI)
    }

    const onLetGo = () => {
      document.removeEventListener('mousemove', onDrag)
      document.removeEventListener('mouseup', onLetGo)
      // svg.innerHTML = svgPath(pointData[pI])
      // draw = true
    } 
    const onGrab = () => {
      document.addEventListener('mousemove', onDrag)
      document.addEventListener('mouseup', onLetGo)
      // draw = false
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
      // manually set value || calculated value
      pathData[pI][i].xy1 = pathData[pI][i].xy1Set || controlPoint(arr[i - 1], arr[i - 2], point, false)
      pathData[pI][i].xy2 = pathData[pI][i].xy2Set || controlPoint(point, arr[i - 1], arr[i + 1], true)

      const { letter, xy1, xy2, xy } = pathData[pI][i]
      return pathData[pI][i].letter === 'C' 
        ? `${letter} ${xy1[0]},${xy1[1]} ${xy2[0]},${xy2[1]} ${xy[0]},${xy[1]}`
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
  
    const { fill, stroke, strokeWidth } = colorData[pI]
    return `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`
  }


  // const path = (d, fill, stroke) =>{
  //   return `<path d="${d}" fill="${fill}" stroke="${stroke}" />`
  // }


  display.addEventListener('mousemove',(e)=>{
    const { x: offSetX, y: offSetY } = display.getBoundingClientRect()
    indicator.innerHTML = `x:${e.clientX - offSetX} y:${e.clientY - offSetY}`
  })
  
  
  //* throttle this?
  display.addEventListener('click', (e)=>{
    if (!draw) return
    const { x: offSetX, y: offSetY } = display.getBoundingClientRect()

    // prep
    pathData[pI].push({})

    // xy id letter xy1 xy2
    pathData[pI][nI] = {
      id: [pI, nI],
      letter: nI === 0 ? 'M' : 'C',
      xy1: [],
      xy2: [],
      dxyAuto: true, //* toggle this to unpair xy1 and xy2
      xy: [e.clientX - offSetX, e.clientY - offSetY],
    }

    // resets xy2Set if set already
    if (pathData[pI][nI - 1] && pathData[pI][nI - 1].xy2Set) pathData[pI][nI - 1].xy2Set = null

    colorData[pI] = {
      fill: fill,
      stroke: stroke,
      strokeWidth: strokeWidth
    }
    
    // prep next  
    outputSvgAndNodes(pI)
    nI++
  })
}

window.addEventListener('DOMContentLoaded', init)