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
        d: 'M 3 3 h 25 v 1 h -23 v 1 h -1 v 19 h 23 v -18 h -3 v 7 h -1 v 5 h -3 v -1 h 1 v -2 h 1 v -4 h 1 v -6 h 5 v 20 h -25 v -22',
        fill: '#000888',
        stroke: '#91938a',
        strokeWidth: 2
      },
      // {
      //   d: 'M 112 99 L 257 58 C 257 58, 329 50, 352 95 C 379 148, 353 180, 353 180 L 195 206',
      //   fill: '#890077',
      //   stroke: '#91938a',
      //   strokeWidth: 4
      // }
    ],
  },
  get convertedPaths() {
    return this.uploadData.paths.map(p => {
      return p.d.split(' ').reduce((acc, item) => {
        const p = item.replaceAll(',','').trim()     
        isNaN(+p)
          ? acc.push({ letter: p, nodes: [] }) 
          : acc[acc.length - 1].nodes.push(+p)
        return acc
      }, [])
    })
  }, 
  paths: [],
  snap: 1,
  addNewPath: true,
  currentPath: null,
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
  //* experimental feature to read h and v command
  addHVpoint(point) {
    const [param, unchangedParam] = point.letter === 'h' ? ['x', 'y'] : ['y', 'x']
    const prevPoint = this.currentPath.points[this.currentPath.points.length - 1]
    const pos = { x: 0, y: 0 }

    // enlarging svg to make it easier to see
    const enlargeFactor = 10

    pos[param] = prevPoint.pos[param] + (point.nodes[0] * enlargeFactor)
    pos[unchangedParam] = prevPoint.pos[unchangedParam]
    new Point({ 
      letter: point.letter, 
      path: this.currentPath, 
      pos,
      singlePos: (point.nodes[0] * enlargeFactor)
    })
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
    const zPoint = new Point({ letter: 'Z', path: this.currentPath })
    // add Last point
    this.currentPath.lastPoint = zPoint.prevPoint
    this.currentPath.lastPoint.isLastPoint = true
    this.currentPath.lastPoint.mainNode.remove()
    this.currentPath.lastPoint.mainNode = null
  },
  outputSvg() {
    ;['w', 'h'].forEach(prop => elements.artboard.nav[prop] = this.uploadData.svg[prop])
    elements.artboard.nav.setStyles()
    console.log(this.convertedPaths)

    this.convertedPaths.forEach((path, i) => {
      ;['fill', 'stroke', 'strokeWidth'].forEach(prop => {
        this.inputs[prop].value = this.uploadData.paths[i][prop]
        this[prop] = this.uploadData.paths[i][prop]
        if (['fill', 'stroke'].includes(prop)) this.inputs[prop].updateColor()
      })
      path.forEach(p => {
        if (['h', 'v'].includes(p.letter)) {
          this.addHVpoint(p)
        } else {
          this[`add${p.letter}point`](p)
        }
      })
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
