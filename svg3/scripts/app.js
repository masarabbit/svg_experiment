import { elements, settings } from './elements.js'
import { NavWindow } from './classes/nav.js'
import { TextArea, Input, Upload } from './classes/input.js'
// import { mouse } from './utils.js'
import { Artboard } from './classes/Artboard.js'
// import { Path } from './classes/path.js'


// TODO change svg layer ordering (this would involve sorting the points array)
// TODO add SVG parser 
   // TODO > enable reading an svg file to output shape

// TODO make visualisation of mode clearer
// TODO add button icons
// TODO add delete path


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
    file: new NavWindow({
      name: 'file',
      container: elements.body,
      isOpen: true,
      pos: { x: 400, y: 0 },
      content: nav => {
        [
          {
            name: 'fileName',
          },
        ].forEach(input => {
          settings.inputs[input.name] = new Input({
            inputName: input.name,
            container: nav.contentWrapper,
            // update: ()=> settings.currentPath.updateSvgStyle()
          })
        })
        nav.addButtons([{
          btnText: 'S',
          action: ()=> {
            elements.artboard.saveSvg()
          }
        }])
        new Upload({ container: nav.contentWrapper })
      }
    }),
    main: new NavWindow({
      name: 'main',
      container: elements.body,
      isOpen: true,
      pos: { x: 400, y: 0 },
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


  //* testing SVG parser

  const path = settings.uploadData.paths[0].d

  const convertPathToArr = path => {
    return path.split(' ').reduce((acc, item) => {
      const p = item.replaceAll(',','').trim()     
      isNaN(+p)
        ? acc.push({ letter: p, nodes: [] }) 
        : acc[acc.length - 1].nodes.push(+p)
      return acc
    }, [])
  }
  console.log(path, convertPathToArr(path))

  // TODO need to check if array can be used to create nodes
    // TODO > create array with mainNodes first, then add curveNodes?

}

window.addEventListener('DOMContentLoaded', init)
