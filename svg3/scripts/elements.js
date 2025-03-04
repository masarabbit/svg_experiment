// import { NavWindow } from './classes/nav.js'
import { Path, Point, LeftNode, RightNode } from './classes/path.js'

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
    svg: {
      w: 418,
      h: 300
    },
    paths: [
      {
        // d: "M 252 107 L 150 180 L 310 269 L 340 151",
        // d: 'M 112 99 L 257 58 C 257 58, 329 50, 352 95 C 379 148, 353 180, 353 180 L 195 206',
        d: 'M 249 89 L 154 157 C 154 157, 190 225, 231 235 C 272 245, 359 208, 359 208 L 316 140 L 249 89 Z',
        fill: '#000888',
        stroke: '#91938a',
        strokeWidth: 2
      },
      {
        d: 'M 112 99 L 257 58 C 257 58, 329 50, 352 95 C 379 148, 353 180, 353 180 L 195 206',
        fill: '#890077',
        stroke: '#91938a',
        strokeWidth: 4
      }
    ],
    get convertedPaths() {
      return this.paths.map(p => {
        return p.d.split(' ').reduce((acc, item) => {
          const p = item.replaceAll(',','').trim()     
          isNaN(+p)
            ? acc.push({ letter: p, nodes: [] }) 
            : acc[acc.length - 1].nodes.push(+p)
          return acc
        }, [])
      })
    } 
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
  addMpoint(point) {
    new Path({ artboard: elements.artboard }, { x: point.nodes[0], y: point.nodes[1] })
  },
  addLpoint(point) {
    new Point({ letter: 'L', path: this.currentPath, pos: { x: point.nodes[0], y: point.nodes[1] }})
  },
  addCpoint(point) {
    const newPoint = new Point({ letter: 'C', path: this.currentPath, pos: { x: point.nodes[4], y: point.nodes[5] }})
    newPoint.leftNode = new LeftNode({
      path: newPoint.path,
      point: newPoint,
      container: newPoint.path.artboard.display,
      pos: { x: point.nodes[2], y: point.nodes[3] },
    })
    if (newPoint.prevPoint) {
      newPoint.prevPoint.rightNode = new RightNode({
        path: newPoint.path,
        point: newPoint.prevPoint,
        container: newPoint.path.artboard.display,
        pos: { x: point.nodes[0], y: point.nodes[1] },
      })
    }
  },
  addZpoint() {
    new Point({ letter: 'Z', path: this.currentPath })
  },
  outputSvg() {
    ;['w', 'h'].forEach(prop => elements.artboard.nav[prop] = this.uploadData.svg[prop])
    elements.artboard.nav.setStyles()

    this.uploadData.convertedPaths.forEach((path, i) => {
      ;['fill', 'stroke', 'strokeWidth'].forEach(prop => {
        this.inputs[prop].value = this.uploadData.paths[i][prop]
        this[prop] = this.uploadData.paths[i][prop]
        if (['fill', 'stroke'].includes(prop)) this.inputs[prop].updateColor()
      })
      path.forEach(p => this[`add${p.letter}point`](p))
      this.currentPath.updatePath()
    })
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
