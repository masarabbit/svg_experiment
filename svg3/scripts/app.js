import { elements, settings } from './elements.js'
import { NavWindow } from './classes/nav.js'
import { TextArea, Input } from './classes/input.js'
// import { mouse } from './utils.js'
import { Artboard } from './classes/Artboard.js'
// import { Path } from './classes/path.js'


// TODO add save / svg download
// TODO make visualisation of mode clearer
// TODO add button icons


function init() {
  elements.windows = {
    artboard: new NavWindow({
      name: 'artboard',
      container: elements.body,
      isOpen: true,
      w: 500, h: 300,
      pos: { x: 10, y: 50 },
      content: nav => {
        new Artboard({ container: nav.contentWrapper, nav })
      }
    }),
    svgInput: new NavWindow({
      name: 'svg input',
      container: elements.body,
      isOpen: true,
      pos: { x: 10, y: 600 },
      content: nav => {
        new TextArea({
          container: nav.contentWrapper,
          inputName: 'svgInput',
          action: e => {
            settings.currentPath.svg.el.innerHTML = `<path d="${e.target.value}"></path>`
          }
        })
      }
    }),
    main: new NavWindow({
      name: 'main',
      container: elements.body,
      isOpen: true,
      pos: { x: 400, y: 0 },
      // fill: 'transparent',
      // stroke: null,
      // strokeWidth: 10,
      // smoothing: 0.2,
      content: nav => {
        [
          {
            name: 'fill',
            isColor: true,
            isNum: false,
          },
          {
            name: 'fillHex',
            isColor: false,
            isNum: false,
          },
          {
            name: 'stroke',
            isColor: true,
            isNum: false,
          },
          {
            name: 'strokeHex',
            isColor: false,
            isNum: false,
          },
          {
            name: 'strokeWidth',
            isColor: false,
            isNum: true,
          },
          {
            name: 'smoothing',
            isColor: false,
            isNum: true,
          },
        ].forEach(input => {
          const { name, isColor, isNum } = input
          settings.inputs[input.name] = new Input({
            inputName: name,
            container: nav.contentWrapper,
            isColor,
            isNum,
            className: isNum ? 'no' : '',
            // update: ()=> settings.currentPath.updateSvgStyle()
          })
        })
      }
    }),
    menuButtons: new NavWindow({
      name: 'menu',
      container: elements.body,
      pos: { x: 10, y: 400 },
      isOpen: true,
      content: nav => nav.addButtons([
        {
          btnText: 'N',
          action: ()=> {
            settings.addNewPath = true
            settings.drawMode = 'plot'
          }
        },
        {
          btnText: 'Z',
          action: ()=> settings.currentPath?.closePath()
        },
        {
          btnText: 'P',
          action: ()=> settings.updateMode('plot')
        },
        {
          btnText: 'D',
          action: ()=> settings.updateMode('delete')
        },
        {
          btnText: 'C',
          action: ()=> {
            settings.updateMode('curve')
          }
        },
        {
          btnText: 'RC',
          action: ()=> settings.updateMode('remove-curve')
        },
        {
          btnText: 'show current',
          action: ()=> {
            console.log('current path', settings.currentPath)
          }
        },
        // {
        //   btnText: 'show el',
        //   action: ()=> {
        //     console.log('el', elements)
        //   }
        // },
        {
          btnText: 'move',
          action: ()=> {
            settings.updateMode('move')
          }
        },
      ])
    })
  }




  settings.updateMode('plot')
  elements.readData()

}

window.addEventListener('DOMContentLoaded', init)
