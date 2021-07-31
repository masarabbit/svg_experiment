function init() {
  //! second cNode seems to be out of sync??
  // maybe compare with what I have on illustrator
  // doesn't consider M too well...

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
  const pathData = {0:{}}
  // const cNodeLines = {0:{}}
  let fill = 'transparent'
  // let stroke = 'transparent'
  let stroke = 'grey'
  let draw = true
  let curve = false
  
  const newPath = () =>{
    nodeIndex = 0
    pathIndex++
    pathDataArray.push([])
    pathData[pathIndex] = {}
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
    updatePath(pI,nI)
    newPath()
  }

  const createNodeLines = () =>{
    // const nextI = nodeIndex === pathDataArray[pathIndex].filter(d=>d!=='Z').length - 1 ? 0 : nodeIndex + 1
    const lines = []
    pathDataArray.forEach((path,pI)=>{
      path.forEach((p,nI)=>{
        if(p[0] === 'C') {
          const {x, y, x1, y1, x2, y2} = pathData[pI][nI]
          lines.push(`<line stroke="red" x1="${x}" y1="${y}" x2="${x2}" y2="${y2}"/>`)

          const prevI = nI === 0 ? pathDataArray[pI].filter(d=>d!=='Z').length - 1 : nI - 1 
          lines.push(`<line stroke="blue" x1="${pathData[pI][prevI].x}" y1="${pathData[pI][prevI].y}" x2="${x1}" y2="${y1}"/>`)
        }
        // if(p[0] === 'C' && pI === pathIndex && nI === nextI) {
        //   const {x, y, x1, y1, x2, y2} = pathData[pI][nI]
        //   lines.push(`<line stroke="blue" x1="${x1}" y1="${y1}" x2="${x}" y2="${y}"/>`)
        // }
        
      })
    })
    line.innerHTML = lines.join('')
  }
  

  const updatePath = (pathIndex,nodeIndex) =>{
    const currentPathData = pathData[pathIndex]
    const pathDataLength = Object.keys(currentPathData).length    
    //! this bit should be converting the entire pathData?
    //! or mayber nodes get pushed back into pathDataArray?
    const nodes = []
    for(let i = 0; i < pathDataLength; i++){
      const {letter, x, y, x1, y1, x2, y2} = currentPathData[i]
      x1? nodes.push(`${letter} ${x1} ${y1}, ${x2} ${y2}, ${x} ${y}`)
        : nodes.push(`${letter} ${x} ${y}`)
    }
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
    const {x1, y1, x2, y2 } = pathData[pI][nI]
    const x = type === 'L' ? x1 : x2
    const y = type === 'L' ? y1 : y2

    cNode.style.left = `${x}px`
    cNode.style.top = `${y}px`  
    cNode.dataset.type = `${type}`
    cNode.dataset.pI = `${pI}`
    cNode.dataset.nI = `${nI}` 
    // console.log('hey x1',x1)
    // console.log('y1',y1)
    // console.log('x2',x2)
    // console.log('y2',y2)
    // if (type === 'L'){
    //   cNodeLines[cNodeIndex] = {

    //   }
    // }
    cNode.addEventListener('mouseenter',()=>draw = false)
    cNode.addEventListener('mouseleave',()=>draw = true)

    const onDrag = e => {
      let originalStyles = window.getComputedStyle(cNode)
      const newX = parseInt(originalStyles.left) + e.movementX
      const newY = parseInt(originalStyles.top) + e.movementY
      cNode.style.left = `${newX}px`
      cNode.style.top = `${newY}px`

      if (type === 'L'){
        pathData[pI][nI].x1 = newX
        pathData[pI][nI].y1 = newY
      } else {
        pathData[pI][nI].x2 = newX
        pathData[pI][nI].y2 = newY
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

  const deleteCNodes = (pI,nI) =>{
    const cNodes = document.querySelectorAll('.cNode')
    cNodes.forEach(n=>{
      //* deletes the node
      const npI = n.dataset.pI
      const npII = n.dataset.nI
      if (pI === +npI && +npII === nI) display.removeChild(n)
    })
  }
  
  // const updatePrevPathData = (pI,nI)=>{
  //   const prevI = nI === 0 ? pathDataArray[pI].filter(d=>d!=='Z').length - 1 : nI - 1 
  //   const {x, y} = pathData[pI][prevI]
  //   pathData[pI][prevI] = {
  //   letter: 'C',
  //   x: x,
  //   y: y,
  //   x1: x - 10,
  //   y1: y - 10,
  //   x2: x + 10,
  //   y2: y + 10,
  //   }
  // }
  
  // const updateNextPathData = (pI,nextI)=>{
  //   // const nextI = nI === pathDataArray[pI].filter(d=>d!=='Z').length - 1 ? 0 : nI + 1
  //   const {x, y} = pathData[pI][nextI]
  //   pathData[pI][nextI] = {
  //   letter: 'C',
  //   x: x,
  //   y: y,
  //   x1: x - 10,
  //   y1: y - 10,
  //   x2: x + 10,
  //   y2: y + 10,
  //   }
  // }

 

  
  //! needs refactoring...
  const nodeAction = e =>{
    if (!curve) return
    const pI = +e.target.dataset.pI
    const nI = +e.target.dataset.nI
    const currentNodeData = pathData[pI][nI]
    const {letter, x, y} = currentNodeData

    // console.log('x',x)
    // console.log('y',y)
    // const prevI = nI === 0 ? pathDataArray[pI].filter(d=>d!=='Z').length - 1 : nI - 1 
    // const nextI = nI === pathDataArray[pI].filter(d=>d!=='Z').length - 1 ? 0 : nI + 1
    // console.log('prev and next',prevI,nI,nextI)
    
    //! refactor this bit - instead of repeating the entire thing, should be able to just deterimine 'currentIndex' as either nI or lastIndex
    //! ... const currentIndex....
    if (nI === 0 && letter !== 'C') {
      //! if first node, update second last node instead of first node - but why?
      //! maybe need to be able to redraw the path with the M being placed somewhere else.  
      const lastIndex = pathDataArray[pI].filter(d=>d!=='Z').length - 1
      const {lX=x, lY=y} = pathData[pI][lastIndex]
      // const {x:lX, y:lY }= pathData[pI][lastIndex]
      console.log('this one?',pathData[pI][lastIndex],'xy',lX)
      pathData[pI][lastIndex] = {
        letter: 'C',
        x: lX,
        y: lY,
        x1: lX - 10,
        y1: lY - 10,
        x2: lX + 10,
        y2: lY + 10,
      }
      addCnode(pI,lastIndex,'L')
      addCnode(pI,lastIndex,'R')
      updatePath(pI,lastIndex)
      closePath(pI,lastIndex + 1)
    } else if(nI === 0 && letter === 'C') {  
      pathData[pI][nI] = {
        letter: 'M',  //! ensures first node is always M rather than L
        y: y,
        x1: '',
        y1: '',
        x2: '',
        y2: '',
      }
      deleteCNodes(pI,nI)
      updatePath(pI,nI)
    } else if(letter === 'C') {
      pathData[pI][nI] = {
        letter: 'L',
        x: x,
        y: y,
        x1: '',
        y1: '',
        x2: '',
        y2: '',
      }
      deleteCNodes(pI,nI)
      updatePath(pI,nI)
    } else {
      pathData[pI][nI] = {
        letter: 'C',
        x: x,
        y: y,
        x1: x - 10,
        y1: y - 10,
        x2: x + 10,
        y2: y + 10,
      }
      // updatePrevPathData(pI,nI)
      // updateNextPathData(pI,nextI)

      deleteCNodes(pI,nI)
      addCnode(pI,nI,'L')
      addCnode(pI,nI,'R')
      updatePath(pI,nI)
    }
    // console.log('latestpath data', pathData)
    // console.log('latest path data array', pathDataArray)
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
      let originalStyles = window.getComputedStyle(node)
      const newX = parseInt(originalStyles.left) + e.movementX
      const newY = parseInt(originalStyles.top) + e.movementY
      node.style.left = `${newX}px`
      node.style.top = `${newY}px`
      const pI = node.dataset.pI
      const nI = node.dataset.nI
      
      pathData[pI][nI].x = newX
      pathData[pI][nI].y = newY
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
    nodeIndex++
    updatePath(pathIndex,nodeIndex)
    // console.log('path',pathData[pathIndex])
  })

  button.forEach(b=>{
    if(b.dataset.c === 'n') b.addEventListener('click',newPath)
    if(b.dataset.c === 'z') b.addEventListener('click',()=>{
      closePath()
    })
    if(b.dataset.c === 'c') b.addEventListener('click',()=>{
      curve = !curve
    })
  })


}

window.addEventListener('DOMContentLoaded', init)
