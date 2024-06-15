import { settings, elements } from './scripts/settings.js'

import { updatePath, addPath, addNode } from './scripts/pathAction.js'
import { newElement } from './scripts/utils.js'



// TODO we need a reliable way to sync node and corresponding data

function init() {

  const svgPath = (style, id) =>{
    const { fill, stroke, strokeWidth } = style
    return `<svg id="svg-${id}" width="100%" height="100%" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"></svg>`
  }

  const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    };
  };

  const addPoint = ({ pos, path }) => {
    const newPoint = {
      letter: 'L',
      pos,
      isCurve: false,
      cNode: {
        xy1: { pos: { x: 0, y: 0 }},
        xy2: { pos: { x: 0, y: 0 }},
        left: null,
        right: null
      },
      index: null,
      path,
    }
    path.points.push(newPoint)
    updatePath(path)
    addNode({ point: newPoint })
    path.points.forEach((p, i) => {
      p.index = i
      p.path = path
      const indexPrev = i === 0 && path.isClosed 
        ? path.isClosed 
          ? path.points.length - 1 
          : null
        : i - 1
      p.prevPoint = !path.isClosed && i === 0 ? null : path.points[indexPrev]
      const indexNext = i === path.points.length - 1 
        ? path.isClosed 
          ? 0
          : null 
        : i + 1
      p.nextPoint = !path.isClosed && i === path.points.length - 1 ? null : path.points[indexNext]
    })
  }

  const addSvg = path => {
    elements.output.appendChild(newElement(svgPath(path.svgStyle, path.id)))
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
        // path: settings.currentPath,
        // pos,
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

  if (btn.dataset.c === 'n') btn.addEventListener('click', ()=> {
    console.log(JSON.stringify(settings.paths[settings.paths.length - 1], getCircularReplacer()))
  })
})

elements.svgInput.addEventListener('change', e => {
  settings.currentPath.svg.innerHTML = `<path d="${e.target.value}"></path>`
  // TODO need some logic to move the node too
})



}

window.addEventListener('DOMContentLoaded', init)
