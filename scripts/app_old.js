function init() {

  //! maybe change to polyline so easier to close path?

  //! second cNode seems to be out of sync??
  // maybe compare with what I have on illustrator
  // doesn't consider M too well...
  // pos needs to be stored differently to make it easier to access.
  // cNode should be added with click, or activated somehow

  const svgInput = document.querySelector('.svg_input')
  const output = document.querySelector('.output')
  const display = document.querySelector('.display')
  const button = document.querySelectorAll('button')
  const offSetX = display.getBoundingClientRect().x
  const offSetY = display.getBoundingClientRect().y

  const pathStart = () =>{
    return `<svg width="100%" height="100%" fill="${fill}" stroke="${stroke}">`
  }
  const pathEnd = '</svg>'

  const pos = {
    x: null,
    y: null
  }
  let count = 0
  let letter = 'M'
  let pathCount = 0
  const pathData = [[]]
  let fill = 'transparent'
  let stroke = 'blue'
  let draw = true
  

  const newPath = () =>{
    count = 0
    pathCount++
    pathData.push([])
    svgInput.value = ''
    letter = 'M'
  }

  const closePath = () =>{
    pathData[pathCount].push('Z')
    // pathData[pathCount].push(pathData[pathCount][0].replace('M','L'))
    svgInput.value = pathData[pathCount]
    output.innerHTML = `${pathStart()}${pathData.map(p=>`<path d="${p}"/>`).join('')}${pathEnd}`
    // newPath()
  }
  

  const updatePath = () =>{
    console.log('pathData',pathData)
    svgInput.value = pathData[pathCount]
    output.innerHTML = `${pathStart()}${pathData.map(p=>`<path d="${p}"/>`).join('')}${pathEnd}`
  }
  
  const updateOutput = () =>{
    output.innerHTML = `${pathStart()}${svgInput.value}${pathEnd}`
  }

  svgInput.addEventListener('change',updateOutput)

  const coords = (letter, data) =>{
    return `${letter} ${data.split(' ').filter((d,i)=>{
      if (i !== 0 && i < 3) return d
    }).join(' ')}`
  } // this determines the coords to be returned.

  const nodeCoords = (letter,data,buffer) =>{
    return `${letter} ${data.split(' ').filter((_d,i)=>i > 0 && i < 3).map((d,i)=>{
      if (i === 0) return +d + buffer
      if (i === 1) return +d + buffer
    }).join(' ')}`
  }

  // const nodeCoords = (letter,data,buffer) =>{
  //   return `${letter} ${data.split(' ').map((d,i)=>{
  //     if (i === 0 && i < 2) return
  //     if (i === 1) return +d + buffer
  //     if (i === 2) return +d + buffer
  //   }).join(' ')}`
  // }

  const addCnode = (pI,pII,buffer,type) =>{
    const cNode = document.createElement('div')
    cNode.classList.add('cNode')
    const x = +pathData[pI][pII].split(' ')[1] + buffer
    const y = +pathData[pI][pII].split(' ')[2] + buffer

    cNode.style.left = `${x}px`
    cNode.style.top = `${y}px`  
    cNode.dataset.i = `${type}_${pI}_${pII}`
    cNode.addEventListener('mouseenter',()=>draw = false)
    cNode.addEventListener('mouseleave',()=>draw = true)

    const onDrag = e => {
      let originalStyles = window.getComputedStyle(cNode)
      const newX = parseInt(originalStyles.left) + e.movementX
      const newY = parseInt(originalStyles.top) + e.movementY
      cNode.style.left = `${newX}px`
      cNode.style.top = `${newY}px`

      const c = pathData[pI][pII].split(' ')

      if (type === 'L'){
        pathData[pI][pII] = `C ${newX} ${newY} , ${c[4]} ${c[5]} , ${c[7]} ${c[8]}`
      } else {
        pathData[pI][pII] = `C ${c[1]} ${c[2]} , ${newX} ${newY} , ${c[7]} ${c[8]}`
      }
      // console.log(pathData[pI][pII].split(' '))
      updatePath()
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

  const deleteCNodes = (pI,pII) =>{
    const cNodes = document.querySelectorAll('.cNode')
    cNodes.forEach(n=>{
      //* deletes the node
      const npI = n.dataset.i.split('_')[1]
      const npII = n.dataset.i.split('_')[2]
      if (pI === +npI && +npII === pII) display.removeChild(n)
    })
  }
  
  //! needs refactoring...
  const nodeAction = e =>{
    const pI = +e.target.dataset.i.split('_')[0]
    const pII = +e.target.dataset.i.split('_')[1]

    if (pII === 0 && pathData[pI].indexOf('Z') === -1) return
    
    // console.log('path',pathData)
    // console.log('indexs',pI,pII)
    // console.log('node',pathData[pI][pII])

    const prevI = pII === 0 ? pathData[pI].filter(d=>d!=='Z').length - 1 : pII - 1 
    const nextI = pII === pathData[pI].filter(d=>d!=='Z').length - 1 ? 0 : pII + 1
    console.log('prev and next',prevI,pII,nextI)
    // console.log(coords('C',pathData[pI][pII]) + coords(',',pathData[pI][prevI]) + coords(',',pathData[pI][nextI]))
    
    if (pII === 0) {
      //! if first node, update second last node instead of first node
      addCnode(pI,pII,10,'L')
      addCnode(pI,pII,-10,'R')

      pathData[pI][pathData[pI].filter(d=>d!=='Z').length - 1] = nodeCoords('C',pathData[pI][pII],10) + nodeCoords(' ,',pathData[pI][pII],-10) + coords(' ,',pathData[pI][pII])
    } else if(pathData[pI][pII].split(' ')[0] === 'C') {
      pathData[pI][pII] = coords('L',pathData[pI][pII])

      deleteCNodes(pI,pII)
    } else {
      deleteCNodes(pI,pII)
      addCnode(pI,pII,10,'L')
      addCnode(pI,pII,-10,'R')
      //*creates curve but only every other

      pathData[pI][pII] = nodeCoords('C',pathData[pI][pII],10) + nodeCoords(' ,',pathData[pI][pII],-10) + coords(' ,',pathData[pI][pII])
      // pathData[pI][pII] = coords('C',pathData[pI][pII]) + coords(' ,',pathData[pI][pII]) + coords(',',pathData[pI][nextI])
    }
    
    updatePath()
  }

  display.addEventListener('mousemove',(e)=>{
    const indicator = document.querySelector('.indicator')
    indicator.innerHTML = `x:${e.clientX - offSetX} y:${e.clientY - offSetY}`
  })

  display.addEventListener('click',(e)=>{
    if (!draw) return

    const offSetX = display.getBoundingClientRect().x
    const offSetY = display.getBoundingClientRect().y
    //! currently no need to disable draw at promximity, because nodeAction is triggered when node is already there.
    // const newX = e.clientX - offSetX
    // const newY = e.clientY - offSetY
    // const checkProximity = pathData[pathCount].map(pathCode=>{
    //   const preX = +pathCode.split(' ')[1]
    //   const preY = +pathCode.split(' ')[2]
    //   console.log(Math.abs(newX - preX))
    //   console.log(Math.abs(newY - preY))
    //   if (Math.abs(newX - preX) < 5 && Math.abs(newY - preY) < 5) {
    //     return 'yes'
    //   } else {
    //     return 'no'
    //   }
    // })
    // console.log('checkProx',checkProximity)
    // if (checkProximity.length) {
    //   console.log('nothing')
    //   return
    // }
    pos.x = e.clientX - offSetX
    pos.y = e.clientY - offSetY
    
    // createnode
    const node = document.createElement('div')
    node.classList.add('node')
    node.style.top = `${pos.y}px`  //!offsetting by half of node width
    node.style.left = `${pos.x}px`
    node.dataset.i = `${pathCount}_${count}`
    node.addEventListener('mouseenter',()=>draw = false)
    node.addEventListener('mouseleave',()=>draw = true)
    node.addEventListener('dblclick',()=>{
      const pathIndex = +node.dataset.i.split('_')[0]
      if (pathData[pathIndex].indexOf('Z') !== -1) return //if closed already, skip
      closePath()
    })
    node.addEventListener('click',(e)=>nodeAction(e))
    display.appendChild(node)

    const onDrag = e => {
      let originalStyles = window.getComputedStyle(node)
      const newX = parseInt(originalStyles.left) + e.movementX
      const newY = parseInt(originalStyles.top) + e.movementY
      node.style.left = `${newX}px`
      node.style.top = `${newY}px`
      const pI = node.dataset.i.split('_')[0]
      const pII = node.dataset.i.split('_')[1]

      if (pathData[pI][pII].split(' ')[0] === 'L') {
        pathData[pI][pII] = `L ${newX} ${newY}`
      } else {
        pathData[pI][pII] = coords('C',pathData[pI][pII]) + nodeCoords(' ,',pathData[pI][pII],10) + nodeCoords(' ,',pathData[pI][pII],-10) 
      }
      pathData[pI][pII] = `L ${newX} ${newY}`
      updatePath()
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
    
    letter = count > 0 ? 'L' : 'M'
    count++
    const newNodeCode = `${letter} ${pos.x} ${pos.y}`
    pathData[pathCount].push(newNodeCode)

    updatePath()
    console.log('path',pathData[pathCount])
  })

  

  button.forEach(b=>{
    if(b.dataset.c === 'n') b.addEventListener('click',newPath)
    if(b.dataset.c === 'z') b.addEventListener('click',()=>{
      closePath()
    })
  })

}

window.addEventListener('DOMContentLoaded', init)

    // svgInput.value = svgInput.value.reduce((acc,c) =>{acc + c},svgInput.value)