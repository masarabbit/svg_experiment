import { elements, settings } from './elements.js'
import { NavWindow } from './classes/nav.js'
import { TextArea } from './classes/input.js'
import { mouse } from './utils.js'
import { Artboard } from './classes/Artboard.js'
import { Path } from './classes/path.js'


// TODO add point delete
// TODO add fill
 // TODO curve has bug when shape is closed with Z
 // TODO enable removal of curve


function init() {
  elements.windows = {
    artboard: new Artboard({
      el: elements.display,
      action: (e, el) => {
        if (settings.drawMode !== 'plot') return
        if (settings.addNewPath) {
          console.log('new')
          settings.currentPath = new Path({}, el.pos(e))
          settings.addNewPath = false
        } else {
          console.log('add')
          settings.currentPath.addPoint('L', el.pos(e))
          // settings.currentPath.updatePath()
          // console.log(el.pos(e))
        }
      }
    }),
    svgInput: new NavWindow({
      name: 'svg input',
      container: elements.body,
      isOpen: true,
      x: 10, y: 600,
      content: nav => {
        new TextArea({
          container: nav.contentWrapper,
          inputName: 'svgInput',
          action: e => {
            console.log('test', settings.currentPath)
              settings.currentPath.svg.el.innerHTML = `<path d="${e.target.value}"></path>`
          }
        })
      }
    }),
    menuButtons: new NavWindow({
      name: 'menu',
      container: elements.body,
      x: 10,
      y: 400,
      isOpen: true,
      content: nav => nav.addButtons([
        {
          btnText: 'N',
          action: ()=> {
            console.log('N')
          }
        },
        {
          btnText: 'Z',
          action: ()=> {
            console.log('Z')
            // settings.currentPath.addPoint('L', settings.currentPath.points[settings.currentPath.points.length -1 ].pos)
            settings.currentPath.closePath()
          }
        },
        {
          btnText: 'C',
          action: ()=> {
            settings.drawMode = settings.drawMode === 'curve' ? 'plot' : 'curve'
            console.log('c', settings.drawMode)
          }
        },
        {
          btnText: 'T',
          action: ()=> {
            console.log('T')
          }
        },
        {
          btnText: 'show',
          action: ()=> {
            console.log('current path', settings.currentPath)
          }
        }
      ])
    })
  }

  console.log(settings.inputs.svgInput.value)


  mouse.move(document, 'add', e => {
    const { x, y } = elements.windows.artboard.pos(e)
    elements.indicator.innerHTML = `${x} | ${y}` 
  })

}

window.addEventListener('DOMContentLoaded', init)
