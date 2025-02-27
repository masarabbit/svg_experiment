// import { convertCameCase } from '../utils.js'
import { settings, elements } from '../elements.js'

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
    // this.buttons.forEach(b => {
    //   new Button({
    //     ...b,
    //     container: buttonWrapper,
    //     action: () => b.action(this)
    //   })
    // })
    // settings.inputs[this.inputName] = this
  }
  // get value() {
  //   return this.input.value.split(',')
  // }
  // set value(val) {
  //   this.input.value = val
  //   settings[this.inputName] = Array.isArray(val) ? val : val.split(',')
  // }
  copyText() {
    this.input.select()
    this.input.setSelectionRange(0, 999999) // For mobile devices 
    document.execCommand('copy')
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
  Button,
}