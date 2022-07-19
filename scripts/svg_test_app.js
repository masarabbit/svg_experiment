function init() {

  // TODO add optional chaining and object parameter where appropriate ({ something, something })
  
  // adapted from ref below
  //ref https://codepen.io/francoisromain/pen/dzoZZj?editors=0010

  // todo node could be in different plane, or classes on 'display' could trigger appearance of node
  // eg: display.hideNode .node { opacity: 0 } + only visible on hover

  // delete node / remove node (nodes needs to be relabelled accordingly)
  // close path (check what the svg looks like in illustrator)
  
  const buttons = document.querySelectorAll('.button')
  const indicator = document.querySelector('.indicator')
  const svg = document.querySelector('.svg')
  const display = document.querySelector('.display')
  const textarea = document.querySelector('textarea')
  const smoothing = 0.2

  //* maybe this should be object?
  //* record letter etc

  // const drawData = {

  // }

  let pI = 0
  let nI = 0
  const fill = 'none'
  const stroke = 'red'
  const strokeWidth = 3
  let draw = true
  let selectedNode 
  const pathData = [[]]
  const colorData = []
  const nodeTypes = ['xy', 'xy1', 'xy2']


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


  const nodeLine = (xy, nextXy1, color) =>{
    if(!xy || !nextXy1) return
    return `<line stroke="${color}" x1="${nextXy1[0]}" y1="${nextXy1[1]}" x2="${xy[0]}" y2="${xy[1]}"/>`
  }

  const nodeLines = pI =>{
    const pointData = pathData[pI].map(n =>{
      if(!n) return ''
      return { xy: n.xy, xy1: n.xy1, xy2: n.xy2 }
    })
    return pointData.map((n, i)=>{
      if(!n.xy) return ''
      const leftLine = n.xy1[0] ? nodeLine(n.xy,n.xy2,'red') : ''
      const rightLine = pointData[i + 1] ? nodeLine(n.xy,pointData[i + 1].xy1,'blue') : ''
      return leftLine + rightLine
    }).join('')
  } 
  


  const outputSvgAndNodes = () =>{    
    svg.innerHTML = pathData.map((data, i)=>{
      // return svgPath(i, data.map(n => n.xy)) + nodeLines(i) // TODO comment his back in for nodes
      return svgPath(i, data.map(n => n.xy))
    }).join('')

    display.innerHTML = ''
    // console.log('pathData', pathData[pI].filter(n=>n.xy))
    nodeTypes.forEach(nodeType => {
      pathData.forEach((data, pI) => {
        data.filter(n => n.xy).map(n => n[nodeType]).forEach((p, nI)=>{
          // console.log('p',p, nodeType)
          if (!p[0]) return
          // addNode({ x:p[0], y:p[1], pI, nI, nodeType}) // TODO comment his back in for nodes
        })
      })
    })
  }

  const addNode = ({ x, y, pI, nI, nodeType }) =>{
    const node = document.createElement('div')
    if (pathData[pI][nI].closed) node.classList.add('z-index-plus')
    node.classList.add('node')
    node.classList.add(nodeType)
    if (`${pI}-${nI}` === selectedNode) node.classList.add('selected')
    node.style.left = `${x}px`
    node.style.top = `${y}px`  
    node.dataset.pI = pI
    node.dataset.nI = nI //todo change this
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

      const nextNi = pathData[pI][nI].closed ? 1 : nI + 1
      const prevNi = nI === 1 && pathData[pI][pathData[pI].length -1].letter === 'Z' 
        ? pathData[pI].length - 2 
        : nI - 1 
      // console.log(`next:${nextNi} - prev:${prevNi}`)

      if (nodeType === 'xy' && pathData[pI][nI].closed){
        pathData[pI][0].xy = [newX, newY]
      }
      
      if (nodeType === 'xy') { 
        pathData[pI][nI][nodeType] = [newX, newY]
        
        // moves xy1 and xy2 if applicable 
        if (pathData[pI][nextNi]?.xy1Set) {
          const { xy1Set: xy } = pathData[pI][nextNi]
          pathData[pI][nextNi].xy1Set = [xy[0] - xDiff, xy[1] - yDiff]
        }
        if (pathData[pI][nI]?.xy2Set) {
          const { xy2Set: xy } = pathData[pI][nI]
          pathData[pI][nI].xy2Set = [xy[0] - xDiff, xy[1] - yDiff]
        } 
      } else {
        pathData[pI][nI][nodeType + 'Set'] = [newX, newY]

        
        if (pathData[pI][nI].dxyAuto){
            // if xy1 was moved, move xy2 accordingly
          if (nodeType === 'xy1' && pathData[pI][prevNi]) {
            const { xy2 } = pathData[pI][prevNi]
            pathData[pI][prevNi].xy2Set = [xy2[0] + xDiff, xy2[1] + yDiff]
          
          // if xy2 was moved, move xy1 accordingly
          } else if (nodeType === 'xy2' && pathData[pI][nextNi]) {
            const { xy1 } = pathData[pI][nextNi]
            pathData[pI][nextNi].xy1Set = [xy1[0] + xDiff, xy1[1] + yDiff]
          }
        }
      }
      outputSvgAndNodes()
    }

    const onLetGo = () => {
      document.removeEventListener('mousemove', onDrag)
      document.removeEventListener('mouseup', onLetGo)
      // draw = true
    } 
    const onGrab = () => {
      document.addEventListener('mousemove', onDrag)
      document.addEventListener('mouseup', onLetGo)
      // draw = false
    }
    
    node.addEventListener('mouseenter',()=> draw = false)
    node.addEventListener('mouseleave',()=> draw = true)
    node.addEventListener('mousedown', onGrab)

    node.addEventListener('click', ()=> {
      indicator.innerHTML = `${nodeType}-${pI}-${nI}-${pathData[pI][nI].letter}`
    })

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


  // const path = (d, fill, stroke) =>{
  //   return `<path d="${d}" fill="${fill}" stroke="${stroke}" />`
  // }


  display.addEventListener('mousemove', e =>{
    const { x: offSetX, y: offSetY } = display.getBoundingClientRect()
    indicator.innerHTML = `x:${e.clientX - offSetX} y:${e.clientY - offSetY}`
  })
  
  
  //* throttle this?
  display.addEventListener('click', e =>{
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
    if (pathData[pI][nI - 1]?.xy2Set) pathData[pI][nI - 1].xy2Set = null

    colorData[pI] = {
      fill: fill,
      stroke: stroke,
      strokeWidth: strokeWidth
    }
    
    // prep next  
    outputSvgAndNodes()
    nI++
  })

  buttons.forEach( button =>{
    if (button.dataset.c === 'z') button.addEventListener('click', ()=> {
      pathData[pI][nI] = {
        id: [pI, nI],
        letter: 'C',
        dxyAuto: true,
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
    })
  })
}

window.addEventListener('DOMContentLoaded', init)