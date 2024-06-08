import { settings, elements } from './scripts/settings.js'

import { updatePath, addPath, addNode } from './scripts/pathAction.js'

function init() {

  const svgPath = id =>{
    const { fill, stroke, strokeWidth } = settings
    return `<svg id="svg-${id}" width="100%" height="100%" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"></svg>`
  }


  const addPoint = ({ pos, path }) => {
    const newPoint = {
      letter: 'L',
      pos,
      isCurve: false
    }
    path.points.push(newPoint)
    path.svg.innerHTML = `<path d="${path.points.map(p => {
      const { letter, pos: { x, y } } = p
      return `${letter} ${x} ${y}`
    })}"></path>`
    updatePath(path)
    addNode({ pos, path, point: newPoint })
    console.log(path.points)
  }

  const addSvg = path => {
    const newSvg = svgPath(path.id)
    const containerDiv = document.createElement('div')
    containerDiv.innerHTML = newSvg
    elements.output.appendChild(containerDiv.firstChild)
    path.svg = document.querySelector(`#svg-${path.id}`)
  }


  elements.display.addEventListener('click', e => {
    if (settings.drawMode !== 'plot') return
    const { left, top } = elements.display.getBoundingClientRect()
    const pos = {
      x: e.pageX - left,
      y: e.pageY - top
    }  
    if (settings.addNewPath) {
      addPath(pos)
      addSvg(settings.paths[0])
      settings.currentPath = settings.paths[0]
      addNode({ 
        path: settings.currentPath,
        pos,
        point: settings.currentPath.points[0]
      })
      settings.idCount++
      settings.addNewPath = false
    } else {
      addPoint({
        pos,
        path: settings.paths[settings.paths.length - 1]
      })
    }
  }
)

elements.buttons.forEach(btn =>{
  if (btn.dataset.c === 'c') btn.addEventListener('click', ()=> {
    settings.drawMode = settings.drawMode === 'curve' ? 'plot' : 'curve'
    console.log(settings.drawMode)
  })
})

elements.svgInput.addEventListener('change', e => {
  settings.currentPath.svg.innerHTML = `<path d="${e.target.value}"></path>`
  // TODO need some logic to move the node too
})



}

window.addEventListener('DOMContentLoaded', init)
