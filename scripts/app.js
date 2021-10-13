function init() {
 
  //! first node not working properly.
  //! delete not working

  //! cNode
  //! need delete....  

  const coordOutput = document.querySelector('.coord_output')
  const svgInput = document.querySelector('.svg_input')
  const output = document.querySelector('.output')
  const display = document.querySelector('.display')
  const button = document.querySelectorAll('button')
  const offSetX = display.getBoundingClientRect().x
  const offSetY = display.getBoundingClientRect().y
  const line = document.querySelector('.line')

  // line.innerHTML = '<line x1="145" y1="245" x2="193" y2="142"/>'

  const pathStart = () =>{
    return `<svg width="100%" height="100%" fill="${fill}" stroke="${stroke}">`
  }
  const pathEnd = '</svg>'

  let letter = 'M'
  let pathIndex = 0
  let nodeIndex = 0
  // let cNodeIndex = 0
  const pathDataArray = [[]]
  const pathData = { 0: {} }
  const nodeLines = { 0: {} }
  const fill = 'transparent'
  // let stroke = 'transparent'
  const stroke = 'grey'
  let draw = true
  let curve = false
  
  const newPath = () =>{
    nodeIndex = 0
    pathIndex++
    pathDataArray.push([])
    pathData[pathIndex] = {}
    nodeLines[pathIndex] = {}
    svgInput.value = ''
    letter = 'M'
  }

  const closePath = (pI,nI) =>{
    pathData[pI][nI] = {
      letter: 'Z',
      x: '',
      y: '',
      x1: '',
      y1: '',
      x2: '',
      y2: ''
    }
    updatePath(pI)
    newPath()
  }
  
  //! rules for creating CNode path should be different for L and R
  //! line data to be created elsewhere, maybe in an object, so that it could looped later...
  const createNodeLines = () =>{
    // const nextI = nodeIndex === pathDataArray[pathIndex].filter(d=>d!=='Z').length - 1 ? 0 : nodeIndex + 1
    const lines = []
    pathDataArray.forEach((path,pI)=>{
      path.forEach((p,nI)=>{
        if (p[0] === 'C') {
          const nextI = nI === pathDataArray[pI].filter(d=>d !== 'Z').length - 2 ? 0 : nI + 1
          // console.log('nextI',nextI)
          // console.log('nodeLines',nodeLines[pI])
          lines.push(nodeLines[pI][nI].nodeL)
          lines.push(nodeLines[pI][nextI].nodeR)
        }
      })
    })
    line.innerHTML = lines.join('')
  }
  

  const updatePath = (pathIndex) =>{
    const currentPathData = pathData[pathIndex]
    const pathDataLength = Object.keys(currentPathData).length    
    //! this bit should be converting the entire pathData?
    //! or mayber nodes get pushed back into pathDataArray?
    const nodes = []
    for (let i = 0; i < pathDataLength; i++){
      const { letter, x, y, x1, y1, x2, y2 } = currentPathData[i]
      x1 ? nodes.push(`${letter} ${x1} ${y1}, ${x2} ${y2}, ${x} ${y}`)
        : nodes.push(`${letter} ${x} ${y}`)
    }

    //* update coordinate display
    svgInput.value = nodes.join(' ')
    coordOutput.innerHTML = nodes.map((node,i)=>{
      return `
        <div class="coord">
          ${i + 1}: ${node}
        </div>
      `
    }).join('')
    pathDataArray[pathIndex] = nodes
    output.innerHTML = `${pathStart()}${pathDataArray.map(p=>`<path d="${p}"/>`).join('')}${pathEnd}`

    createNodeLines()
  }
  
  const updateOutput = () =>{
    output.innerHTML = `${pathStart()}${svgInput.value}${pathEnd}`
  }

  svgInput.addEventListener('change',updateOutput)

  
  const addCnode = (pI,nI,type) =>{
    const cNode = document.createElement('div')
    cNode.classList.add('cNode')
    const { x1, y1, x2, y2 } = pathData[pI][nI]
    const x = type === 'L' ? x2 : x1
    const y = type === 'L' ? y2 : y1

    cNode.style.left = `${x}px`
    cNode.style.top = `${y}px`  
    cNode.dataset.type = `${type}`
    cNode.dataset.pI = `${pI}`
    cNode.dataset.nI = `${nI}` 

    cNode.addEventListener('mouseenter',()=>draw = false)
    cNode.addEventListener('mouseleave',()=>draw = true)

    const onDrag = e => {
      const originalStyles = window.getComputedStyle(cNode)
      const newX = parseInt(originalStyles.left) + e.movementX
      const newY = parseInt(originalStyles.top) + e.movementY
      cNode.style.left = `${newX}px`
      cNode.style.top = `${newY}px`

      if (type === 'L'){
        pathData[pI][nI].x2 = newX
        pathData[pI][nI].y2 = newY
        nodeLines[pI][nI].nodeL = `<line stroke="red" x1="${newX}" y1="${newY}" x2="${pathData[pI][nI].x}" y2="${pathData[pI][nI].y}"/>`
      } else {
        const prevI = nI  === 0 ? pathDataArray[pI].filter(d=>d !== 'Z').length - 1 : nI  - 1 
        pathData[pI][nI].x1 = newX
        pathData[pI][nI].y1 = newY
        nodeLines[pI][nI].nodeR = `<line stroke="blue" x1="${newX}" y1="${newY}" x2="${pathData[pI][prevI].x}" y2="${pathData[pI][prevI].y}"/>`
      }
      updatePath(pI,nI)
    }

    const onLetGo = () => {
      document.removeEventListener('mousemove', onDrag)
      document.removeEventListener('mouseup', onLetGo)
    }    
    const onGrab = () => {
      document.addEventListener('mousemove', onDrag)
      document.addEventListener('mouseup', onLetGo)
    }
    cNode.addEventListener('mousedown', onGrab)

    display.appendChild(cNode)
  }

  const deleteCNodes = (pI,nI,type) =>{
    const cNodes = document.querySelectorAll('.cNode')
    cNodes.forEach(n=>{
      const npI = n.dataset.pI
      const nnI = n.dataset.nI
      const nType = n.dataset.type
      if (pI === +npI && +nnI === nI && nType === type) display.removeChild(n)
    })
  }

  
  //! needs refactoring...
  const nodeAction = e =>{
    if (!curve) return
    const pI = +e.target.dataset.pI
    const nI = +e.target.dataset.nI
    const currentNodeData = pathData[pI][nI]
    const { letter, x, y } = currentNodeData

    // console.log('x',x)
    // console.log('y',y)
    
    //! these work around for the first index is not working 100%
    const currentI = nI === 0 ? pathDataArray[pI].filter(d=>d !== 'Z').length - 1 : nI //! maybe this needs to be added to other nodes too?
    const prevI = currentI  === 0 ? pathDataArray[pI].filter(d=>d !== 'Z').length - 1 : currentI  - 1 
    const nextI = currentI  === pathDataArray[pI].filter(d=>d !== 'Z').length - 1 ? 0 : currentI  + 1

    if (letter !== 'C') {
      pathData[pI][currentI].letter = 'C'
      pathData[pI][currentI].x1 = pathData[pI][currentI].x1 || pathData[pI][prevI].x
      pathData[pI][currentI].y1 = pathData[pI][currentI].y1 || pathData[pI][prevI].y
      pathData[pI][currentI].x2 = pathData[pI][currentI].x2 || x - 10
      pathData[pI][currentI].y2 =  pathData[pI][currentI].y2 || y - 10

      pathData[pI][nextI].letter = 'C'
      pathData[pI][nextI].x2 = pathData[pI][nextI].x2 || pathData[pI][nextI].x + 10
      pathData[pI][nextI].y2 = pathData[pI][nextI].y2 || pathData[pI][nextI].y + 10
      pathData[pI][nextI].x1 = pathData[pI][nextI].x1 || x + 10
      pathData[pI][nextI].y1 = pathData[pI][nextI].y1 || y + 10

      addCnode(pI,currentI,'L')
      addCnode(pI,nextI,'R')
      nodeLines[pI][currentI].nodeL = `<line stroke="red" x1="${x}" y1="${y}" x2="${x - 10}" y2="${y - 10}"/>`
      nodeLines[pI][nextI].nodeR = `<line stroke="blue" x1="${pathData[pI][nextI].x1}" y1="${pathData[pI][nextI].y1}" x2="${x}" y2="${y}"/>`
      updatePath(pI)
    } else {
      pathData[pI][currentI].letter = 'L'
      pathData[pI][currentI].x1 = ''
      pathData[pI][currentI].y1 = ''
      pathData[pI][currentI].x2 = ''
      pathData[pI][currentI].y2 = ''
      nodeLines[pI][currentI].nodeL = ''
      nodeLines[pI][nextI].nodeR = ''

      deleteCNodes(pI,currentI,'L')
      deleteCNodes(pI,nextI,'R')
      updatePath(pI)
    }

    console.log('latestpath data', pathData)
    console.log('latest path data array', pathDataArray)
  }

  display.addEventListener('mousemove',(e)=>{
    const indicator = document.querySelector('.indicator')
    indicator.innerHTML = `x:${e.clientX - offSetX} y:${e.clientY - offSetY}`
  })

  display.addEventListener('click',(e)=>{
    if (!draw) return
    const offSetX = display.getBoundingClientRect().x
    const offSetY = display.getBoundingClientRect().y
    const x = e.clientX - offSetX
    const y = e.clientY - offSetY
    
    // createnode
    const node = document.createElement('div')
    node.classList.add('node')
    node.style.left = `${x}px`
    node.style.top = `${y}px`
    node.dataset.pI = `${pathIndex}`
    node.dataset.nI = `${nodeIndex}`

    node.addEventListener('mouseenter',()=>draw = false)
    node.addEventListener('mouseleave',()=>draw = true)
    node.addEventListener('dblclick',()=>{
      const pathIndexToCheck = +node.dataset.pI
      if (pathDataArray[pathIndexToCheck].indexOf('Z') !== -1) return //if closed already, skip
      closePath(pathIndex,nodeIndex)
    })
    node.addEventListener('click',(e)=>nodeAction(e))
    display.appendChild(node)

    const onDrag = e => {
      const originalStyles = window.getComputedStyle(node)
      const newX = parseInt(originalStyles.left) + e.movementX
      const newY = parseInt(originalStyles.top) + e.movementY
      node.style.left = `${newX}px`
      node.style.top = `${newY}px`
      const pI = +node.dataset.pI
      const nI = +node.dataset.nI
      
      pathData[pI][nI].x = newX
      pathData[pI][nI].y = newY
      
      if (nodeLines[pI][nI].nodeL !== ''){

        const nextI = nI  === pathDataArray[pI].filter(d=>d !== 'Z').length - 1 ? 0 : nI + 1
        // const prevI = nI  === 0 ? pathDataArray[pI].filter(d=>d!=='Z').length - 1 : nI  - 1 

        console.log('nextI',nextI)
        console.log('nodeLines',nodeLines[pI])

        nodeLines[pI][nI].nodeL = `<line stroke="red" x1="${pathData[pI][nI].x2}" y1="${pathData[pI][nI].y2}" x2="${newX}" y2="${newY}"/>`

        nodeLines[pI][nextI].nodeR = `<line stroke="blue" x1="${pathData[pI][nextI].x1}" y1="${pathData[pI][nextI].y1}" x2="${newX}" y2="${newY}"/>`
      }
      updatePath(pI)
    }

    const onLetGo = () => {
      document.removeEventListener('mousemove', onDrag)
      document.removeEventListener('mouseup', onLetGo)
    } 
    const onGrab = () => {
      document.addEventListener('mousemove', onDrag)
      document.addEventListener('mouseup', onLetGo)
    }
    node.addEventListener('mousedown', onGrab)

    letter = nodeIndex > 0 ? 'L' : 'M'
    node.classList.add(letter)
    pathData[pathIndex][nodeIndex] = {
      letter: letter,
      x: x,
      y: y,
      x1: '',
      y1: '',
      x2: '',
      y2: ''
    }

    nodeLines[pathIndex][nodeIndex] = {
      nodeL: '',
      nodeR: ''
    }
    nodeIndex++
    updatePath(pathIndex)
    // console.log('path',pathData[pathIndex])
  })

  button.forEach(b=>{
    if (b.dataset.c === 'n') b.addEventListener('click',newPath)
    if (b.dataset.c === 'z') b.addEventListener('click',()=>{
      closePath()
    })
    if (b.dataset.c === 'c') b.addEventListener('click',()=>{
      curve = !curve
    })
  })


}

window.addEventListener('DOMContentLoaded', init)
