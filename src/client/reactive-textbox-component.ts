import { BaseComponent } from "./base-component"

export class ReactiveTextboxComponent extends BaseComponent<{
  callback: (value: string) => void
}>{

  textboxValue: string = ''
  callbackTimeout: any

  template = /*html*/ `
    <input :value="textboxValue" type="search" @input="handleInput" $attrs="props" />
  `

  handleInput(event: any) {
    this.textboxValue = event.target.value
    if (this.callbackTimeout) {
      clearTimeout(this.callbackTimeout)
    }
    this.callbackTimeout = setTimeout(() => {
      this.props.callback(this.textboxValue)
      this.callbackTimeout = null
    }, 400)
  }
}