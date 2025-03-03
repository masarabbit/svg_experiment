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


export {
  TextArea,
  Input,
  Button,
}