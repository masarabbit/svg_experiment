// import { NavWindow } from './classes/nav.js'

const elements = {
  body: document.querySelector('body'),
  indicator: document.querySelector('.indicator'),
  modeIndicator: document.querySelector('.mode-indicator'),
  windows: {},
  saveDataName: 'svg-window-pos',
  saveData() {
    const obj = {}
    Object.keys(this.windows).forEach(key => {
      const { pos, isOpen, w, h } = this.windows[key]
      obj[key] = { pos, isOpen, w, h }
    })
    const { strokeWidth, smoothing, fillHex, strokeHex } = settings
    localStorage.setItem(this.saveDataName, JSON.stringify({...obj, strokeWidth, smoothing, fillHex, strokeHex }))
  },
  readData() {
    const saveData = localStorage.getItem(this.saveDataName)
    if (saveData) {
      const data = JSON.parse(saveData)

      Object.keys(data).forEach(key => {
        if (['strokeWidth', 'smoothing', 'fillHex', 'strokeHex'].includes(key)) {
          settings.inputs[key].value = data[key]
          settings[key] = data[key]
          if (key.includes('Hex')) settings.inputs[key].updateColor()
        } else { 
          ;['pos', 'isOpen', 'w', 'h'].forEach(prop => {
            this.windows[key][prop] = data[key][prop]
          })
          this.windows[key].setUp()
        }
      })
    }
  }
}

const settings = {
  uploadedFile: null,
  //* presetting for testing purpose
  uploadData: {
    svgs: [
      {
        w: 418,
        h: 383
      }
    ],
    paths: [
      {
        // d: "M 252 107 L 150 180 L 310 269 L 340 151",
        // d: 'M 112 99 L 257 58 C 257 58, 329 50, 352 95 C 379 148, 353 180, 353 180 L 195 206',
        d: 'M 249 89 L 154 157 C 154 157, 190 225, 231 235 C 272 245, 359 208, 359 208 L 316 140 L 249 89 Z',
        fill: '#55d93a',
        stroke: '#91938a',
        strokeWidth: 2
      }
    ]
  },
  paths: [],
  snap: 1,
  addNewPath: true,
  currentPath: null,
  paths: [],
  idCount: 0,
  drawMode: 'plot',
  fileName: 'svg',
  recordState() {
    console.log('record')
  },
  inputs: {},
  updateMode(mode) {
    this.drawMode = mode
    elements.modeIndicator.innerHTML = this.drawMode

    const moveAction = mode === 'move' ? 'add' : 'remove'
    document.querySelector('.output-svg').classList[moveAction]('touch')
    document.querySelector('.display').classList[moveAction]('freeze')
  },
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
