// import { camelCaseToNormalString } from '../utils.js'
import { settings, elements } from '../elements.js'
import { camelCaseToNormalString } from '../utils.js'
class TextArea {
  constructor(props) {
    Object.assign(this, {
      el: Object.assign(document.createElement('div'), {
        innerHTML: `<textarea className="${props.className || ''}" spellcheck="false" />`
      }),
      inputName: props.inputName || props.className,
      ...props
    })
    this.container.append(this.el)
    this.input = this.el.querySelector('textarea')
    this.input.addEventListener('change', this.action)
    const buttonWrapper = Object.assign(document.createElement('div'), {
      className: 'mini-wrap',
    })
    this.el.append(buttonWrapper)
    settings.inputs[this.inputName] = this
  }
  get value() {
    return this.input.value
  }
  set value(val) {
    this.input.value = val
  }
  copyText() {
    this.input.select()
    this.input.setSelectionRange(0, 999999) // For mobile devices 
    document.execCommand('copy')
  }
}

class Input {
  constructor(props) {
    const label = camelCaseToNormalString(props.inputName)
    Object.assign(this, {
      el: Object.assign(document.createElement('div'), {
        className: props.isColor ? 'color-input-wrap' : 'input-wrap',
        innerHTML: `
          <label class="${props.isColor ? 'color-label' : ''}" for="${props.inputName}">
            ${props.isColor ? '' : label}
          </label>
          <input 
            id="${props.inputName}" 
            class="${props?.className || ''} ${props.inputName}" 
            type="${props.isColor ? 'color' : 'text'}" 
            placeholder="${label}"
          >
        `
      }),
      ...props,
    })
    props.container.appendChild(this.el)
    this.input = this.el.querySelector('input')
    this.addChangeListener()
    // if (this.default) settings[this.inputName] = this.default
    settings.inputs[this.inputName] = this
    // .input
    if (['fill', 'stroke'].includes(this.inputName)) {
      this.label = this.el.querySelector('label')
      this.updateColor()
    } else {
      this.input.value = settings[props.inputName]
    }
  }
  get value() {
    return this.isNum ? +this.input.value : this.input.value
  }
  set value(val) {
    const v = this.isNum ? +val : val
    this.input.value = v
    settings[this.inputName] = v
  }
  updateColor() {
    const { inputName } = this
    const label = this.label || settings.inputs[inputName.replace('Hex', '')].label
    label.style.backgroundColor = settings[inputName]
    if (settings.inputs?.[inputName + 'Hex']) settings.inputs[inputName + 'Hex'].value = settings[inputName]
    if (settings.inputs?.[inputName.replace('Hex', '')]) settings.inputs[inputName.replace('Hex', '')].value = settings[inputName]
  }
  addChangeListener() {
    this.input.addEventListener('change', e => {
      settings[this.inputName] = e.target.value
      if (['fill', 'fillHex', 'stroke', 'strokeHex'].includes(this.inputName)) this.updateColor()
      if (settings.currentPath) settings.currentPath.updateSvgStyle()
      if (this.update) this.update() 
    })
  }
}

class Button {
  constructor(props) {
    Object.assign(this, {
      el: Object.assign(document.createElement('button'), {
        className: `btn ${props?.className || ''}`,
        innerHTML: props?.btnText || '',
      }),
      ...props,
    })
    props.container.appendChild(this.el)
    this.el.addEventListener('click', ()=> this.action(this))
  }
}


class Upload {
  constructor(props) {
    Object.assign(this, {
      el: Object.assign(document.createElement('div'), {
        className: 'upload-wrapper',
        innerHTML: `
          <input id="upload" class="d-none" type="file" single/>
          <label for="upload" class="upload btn">U</label>
          <div></div>
        `
      }),
      ...props
    })
    this.container.appendChild(this.el)
      ;['input', 'label', 'display'].forEach(key => this[key] = this.el.querySelector(`${key === 'display' ? 'div' : key}`))

    this.outputBtn = new Button({
      container: this.container,
      className: 'd-none',
      action: () => {
        this.handleFiles(settings.uploadedFile)
      }
    })
    this.el.addEventListener('change', () => {
      settings.uploadedFile = this.input.files[0]
      this.display.innerHTML = settings.uploadedFile.name
      this.outputBtn.el.classList.remove('d-none')
    })
  }
  handleFiles(file){
    const reader = new FileReader()
    reader.onload = function(e) {
      const svgData = e.target.result
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgData, "image/svg+xml")
      const svgTags = doc.getElementsByTagName("svg")
      const pathTags = doc.getElementsByTagName("path")

      settings.uploadData = {
        svgs: Array.from(svgTags).map(s => {
          return { 
            w: s.width.baseVal.value,
            h: s.height.baseVal.value
          }
        }),
        paths: Array.from(pathTags).map(p => {
          const { d, fill, stroke, 'stroke-width': strokeWidth } = p.attributes
          return {
            d: d.value,
            fill: fill.value,
            stroke: stroke.value,
            strokeWidth: strokeWidth.value,
          }
        })
      }
      console.log(settings.uploadData)
    }
    reader.readAsText(file)
}
}


export {
  TextArea,
  Input,
  Button,
  Upload
}