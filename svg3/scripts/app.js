import { elements, settings } from './elements.js'
import { NavWindow } from './classes/nav.js'
import { TextArea, Input, Upload } from './classes/input.js'
// import { mouse } from './utils.js'
import { Artboard } from './classes/artboard.js'

// TODO change svg layer ordering (this would involve sorting the points array)

// TODO make visualisation of mode clearer
// TODO add button icons
// TODO add delete path
// TODO add hide nodes option
// TODO possibly add additional path output to show 'outline' in the line-output
// TODO add ways to enlarge / shrink svg  (should be able to do by multiplying the vectors)

function init() {
  elements.windows = {
    artboard: new NavWindow({
      name: 'artboard',
      container: elements.body,
      isOpen: true,
      w: 500,
      h: 300,
      pos: { x: 10, y: 50 },
      content: nav => {
        new Artboard({ container: nav.contentWrapper, nav })
      },
    }),
    svgInput: new NavWindow({
      name: 'svg input',
      container: elements.body,
      isOpen: true,
      pos: { x: 10, y: 440 },
      content: nav => {
        new TextArea({
          container: nav.contentWrapper,
          inputName: 'svgInput',
          action: e => {
            settings.updateSvgWithD(e.target.value)
          },
        })
      },
    }),
    file: new NavWindow({
      name: 'file',
      container: elements.body,
      isOpen: true,
      pos: { x: 540, y: 110 },
      content: nav => {
        ;[
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
        nav.addButtons([
          {
            btnText: 'S',
            action: () => {
              elements.artboard.saveSvg()
            },
          },
        ])
        new Upload({ container: nav.contentWrapper })
      },
    }),
    main: new NavWindow({
      name: 'main',
      container: elements.body,
      isOpen: true,
      pos: { x: 360, y: 360 },
      content: nav => {
        ;[
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
      },
    }),
    menuButtons: new NavWindow({
      name: 'menu',
      container: elements.body,
      pos: { x: 10, y: 360 },
      isOpen: true,
      content: nav =>
        nav.addButtons([
          {
            btnText: 'N',
            action: () => {
              settings.addNewPath = true
              settings.drawMode = 'plot'
            },
          },
          {
            btnText: 'Z',
            action: () => settings.currentPath?.closePath(),
          },
          {
            btnText: 'P',
            action: () => settings.updateMode('plot'),
          },
          {
            btnText: 'D',
            action: () => settings.updateMode('delete'),
          },
          {
            btnText: 'C',
            action: () => {
              settings.updateMode('curve')
            },
          },
          {
            btnText: 'RC',
            action: () => settings.updateMode('remove-curve'),
          },
          {
            btnText: 'show current',
            action: () => {
              console.log('current path', settings.currentPath)
            },
          },
          // {
          //   btnText: 'show el',
          //   action: ()=> {
          //     console.log('el', elements)
          //   }
          // },
          {
            btnText: 'move',
            action: () => {
              settings.updateMode('move')
            },
          },
          {
            btnText: 'pixellate',
            action: () => {
              settings.shouldPixelate = !settings.shouldPixelate
              if (!settings.shouldPixelate) {
                elements.artboard.canvas.clearCanvas()
                elements.artboard.output.classList.remove('hide')
              } else {
                elements.artboard.pixelate()
              }
            },
          },
          {
            btnText: 'download',
            action: () => {
              elements.artboard.downloadImage()
            },
          },
        ]),
    }),
    size: new NavWindow({
      name: 'artboard size',
      container: elements.body,
      isOpen: true,
      pos: { x: 540, y: 50 },
      content: nav => {
        ;[
          {
            name: 'column',
          },
          {
            name: 'row',
          },
        ].forEach(input => {
          settings.inputs[input.name] = new Input({
            inputName: input.name,
            container: nav.contentWrapper,
            isNum: true,
            className: 'no',
            update: e => {
              elements.artboard.nav[
                {
                  column: 'w',
                  row: 'h',
                }[input.name]
              ] = e.target.value
              elements.artboard.roundBoardSize()
            },
          })
          settings.inputs[input.name].value =
            elements.artboard.canvas[input.name]
        })
      },
    }),
  }

  settings.updateMode('plot')
  elements.readData()

  // console.log(path, convertedPath, elements)

  // TODO need to check if array can be used to create nodes
  // TODO > create array with mainNodes first, then add curveNodes?
}

window.addEventListener('DOMContentLoaded', init)
