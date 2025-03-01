// import { NavWindow } from './classes/nav.js'

const elements = {
  body: document.querySelector('body'),
  indicator: document.querySelector('.indicator'),
  display: document.querySelector('.display'),
  output: document.querySelector('.output'),
  lineOutput: document.querySelector('.line-output'),
  windows: {},
  saveDataName: 'window-pos',
  // saveData() {
  //   const obj = {}
  //   Object.keys(this.windows).forEach(key => {
  //     const { x, y, isOpen } = this.windows[key]
  //     const { column, row, cellSize } = settings
  //     obj[key] = { x, y, isOpen, column, row, cellSize }
  //   })
  //   localStorage.setItem(this.saveDataName, JSON.stringify(obj))
  // },
  // readData() {
  //   const saveData = localStorage.getItem(this.saveDataName)
  //   if (saveData) {
  //     const data = JSON.parse(saveData)

  //     Object.keys(data).forEach(key => {
  //       ;['x', 'y', 'isOpen'].forEach(prop => {
  //         this.windows[key][prop] = data[key][prop]
  //       })
  //       this.windows[key].setUp()

  //       ;['column', 'row', 'cellSize'].forEach(prop => {
  //         settings.inputs[prop].value = data[key][prop]
  //       })
  //       this.artboard.resize()
  //     })
  //   }
  // }
}

const settings = {
  paths: [],
  svgStyle: {
    fill: 'transparent',
    stroke: 'grey',
    strokeWidth: 2,
    smoothing: 0.2,
  },
  snap: 1,
  addNewPath: true,
  currentPath: null,
  paths: [],
  idCount: 0,
  prevDrawMode: 'plot',
  drawMode: 'plot',
  recordState() {
    console.log('record')
  },
  inputs: {}
  // get currentPath() {
  //   return this.paths[this.currentIndex]
  // }
}

export {
  elements,
  settings,
}
