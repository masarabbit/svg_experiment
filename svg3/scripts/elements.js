// import { NavWindow } from './classes/nav.js'

const elements = {
  body: document.querySelector('body'),
  indicator: document.querySelector('.indicator'),
  display: document.querySelector('.display'),
  output: document.querySelector('.output'),
  lineOutput: document.querySelector('.line-output'),
  windows: {},
  saveDataName: 'svg-window-pos',
  saveData() {
    const obj = {}
    Object.keys(this.windows).forEach(key => {
      const { pos, isOpen, w, h } = this.windows[key]
      const { strokeWidth, smoothing, fillHex, strokeHex } = settings
      obj[key] = { pos, isOpen, w, h, strokeWidth, smoothing, fillHex, strokeHex }
    })
    localStorage.setItem(this.saveDataName, JSON.stringify(obj))
  },
  readData() {
    const saveData = localStorage.getItem(this.saveDataName)
    if (saveData) {
      const data = JSON.parse(saveData)

      Object.keys(data).forEach(key => {
        ;['pos', 'isOpen', 'w', 'h'].forEach(prop => {
          this.windows[key][prop] = data[key][prop]
        })
        this.windows[key].setUp()

        ;['strokeWidth', 'smoothing', 'fillHex', 'strokeHex'].forEach(prop => {
          settings.inputs[prop].value = data[key][prop]
        })
      })
    }
  }
}

const settings = {
  paths: [],
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
  inputs: {},
  
  // svg styling
  fill: 'transparent',
  fillHex: 'transparent',
  stroke: '#cccccc',
  strokeHex: '#cccccc',
  strokeWidth: 10,
  smoothing: 0.2,

  // get currentPath() {
  //   return this.paths[this.currentIndex]
  // }
}

export {
  elements,
  settings,
}
