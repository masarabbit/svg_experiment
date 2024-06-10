const elements = {
  display: document.querySelector('.display'),
  output: document.querySelector('.output'),
  svgInput: document.querySelector('.svg-input'),
  buttons: document.querySelectorAll('.btn'),
  lineOutput: document.querySelector('.line-output'),
}

const settings = {
  paths: [],
  svgStyle: {
    fill: 'transparent',
    stroke: 'grey',
    strokeWidth: 1,
    smoothing: 0.2,
  },
  addNewPath: true,
  currentPath: null,
  idCount: 0,
  prevDrawMode: 'plot',
  drawMode: 'plot'
}

export {
  elements,
  settings
}


  // const coordOutput = document.querySelector('.coord_output')
  // const output = document.querySelector('.output')
  // const offSetX = display.getBoundingClientRect().x
  // const offSetY = display.getBoundingClientRect().y
  // const line = document.querySelector('.line')
