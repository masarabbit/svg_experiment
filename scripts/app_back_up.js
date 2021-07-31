function init() {

  //! maybe change to polyline so easier to close path?

  const svgInput = document.querySelector('.svg_input')
  const output = document.querySelector('.output')
  const display = document.querySelector('.display')
  const button = document.querySelectorAll('button')

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
    newPath()
  }
  

  const updatePath = () =>{
    svgInput.value = pathData[pathCount]
    output.innerHTML = `${pathStart()}${pathData.map(p=>`<path d="${p}"/>`).join('')}${pathEnd}`
  }
  
  const updateOutput = () =>{
    output.innerHTML = `${pathStart()}${svgInput.value}${pathEnd}`
  }

  svgInput.addEventListener('change',updateOutput)
  
  //! needs refactoring...
  const nodeAction = e =>{
    const pathIndex = +e.target.dataset.i.split('_')[0]
    const pathIndexIndex = +e.target.dataset.i.split('_')[1]

    if (pathIndexIndex === 0) {
      console.log(pathData[pathIndex])
      console.log('trigger test',pathData[pathIndex][pathData[pathIndex].length - 2])

      const pathCode = pathData[pathIndex][0].split(' ')
      if ((pathData[pathIndex].indexOf('Z') === -1 && pathCode[0] === 'M') && pathCode[0] === 'C') return
      const firstHandle = pathData[pathIndex][pathIndexIndex].split(' ').map((p,i)=>{
        if (i === 3) return ','
        return i > 0 ? +p + 300 : ''
      }).join(' ')
      
      const secondHandle = pathCode.map((p,i)=>{
        if (i === 3) return
        return i > 0 ? p : ''
      }).join(' ')

      pathData[pathIndex][pathData[pathIndex].length] = pathCode.map((p,i)=>{
        if (i === 3) return ','
        return i === 0 ? 'C' : p
      }).join(' ') + firstHandle + secondHandle

    } else { //for the rest
      const pathCode = pathData[pathIndex][pathIndexIndex].split(' ')
      console.log('pathData', pathData[pathIndex])
      console.log('length', pathData[pathIndex].length)

      if (pathCode[0] === 'M' || pathCode[0] === 'C') return
      const firstHandle = pathCode.map((p,i)=>{
        if (i === 3) return ','
        return i > 0 ? +p + 20 : ''
      }).join(' ')
      
      const secondHandle = pathCode.map((p,i)=>{
        if (i === 3) return
        return i > 0 ? +p - 20 : ''
      }).join(' ')
  
      pathData[pathIndex][pathIndexIndex] = pathCode.map((p,i)=>{
        if (i === 3) return ','
        return i === 0 ? 'C' : p
      }).join(' ') + firstHandle + secondHandle
    } 
    updatePath()
  }

  display.addEventListener('click',(e)=>{
    if (!draw) return

    const offSetX = display.getBoundingClientRect().x
    const offSetY = display.getBoundingClientRect().y
    if (Math.abs(pos.x - (e.clientX - offSetX)) < 5 && Math.abs(pos.y - (e.clientY - offSetY) < 5)) {
      console.log('nothing') //! only triggers when prev pos was different, need to trigger when their's node.
      return
    }
    pos.x = e.clientX - offSetX
    pos.y = e.clientY - offSetY
    
    // createnode
    const node = document.createElement('div')
    node.classList.add('node')
    node.style.top = `${pos.y - 4}px`  //!offsetting by half of node width
    node.style.left = `${pos.x - 4}px`
    node.dataset.i = `${pathCount}_${count}`
    node.addEventListener('mouseenter',()=>draw = false)
    node.addEventListener('mouseleave',()=>draw = true)
    node.addEventListener('dblclick',()=>{
      const pathIndex = +node.dataset.i.split('_')[0]
      if (pathData[pathIndex].indexOf('Z') !== -1) return //if closed already, skip
      closePath()
    })
    // node.addEventListener('click',(e)=>nodeAction(e))
    display.appendChild(node)
    
    letter = count > 0 ? 'L' : 'M'
    count++
    const newNodeCode = `${letter} ${pos.x} ${pos.y} `
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