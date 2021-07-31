function init() {
  const pathData = {}
  let pathIndex = 0
  let nodeIndex = 0

  console.log('pathData',pathData)

  pathData[pathIndex] = {}

  pathData[pathIndex][nodeIndex] = {
    letter: 'X',
    x: 200,
    y: 400
  }

  console.log('pathData',pathData)

}

window.addEventListener('DOMContentLoaded', init)