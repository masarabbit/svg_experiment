import PageObject from './pageObject.js';

class Artboard extends PageObject {
  constructor(props) {
    super({
      el: props.el,
      ...props,
    })
    this.el.addEventListener('click', e => this.action(e, this))
  }
  pos(e) {
    const { left, top } = this.el.getBoundingClientRect()
    return {
      x: e.pageX - left,
      y: e.pageY - top
    }  
  }
}

export {
  Artboard
}