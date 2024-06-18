import { BaseComponent } from "./base-component"

export class BackArrowComponent extends BaseComponent<{
  action?: ()=>void
}> {
  template = /*html*/ `
    <div @click="handleClick" class="ml-5 cursor-pointer">
      <i class="fa fa-angle-left fa-2x"></i>
    </div>
  `
  handleClick() {
    if (this.props.action) {
      this.props.action()
    } 
  }
}

export class DoubleBackArrowComponent extends BaseComponent<{
  action?: ()=>void
}> {
  template = /*html*/ `
    <div @click="handleClick" class="ml-5 cursor-pointer">
      <i class="fa fa-angle-double-left fa-2x"></i>
    </div>
  `
  handleClick() {
    if (this.props.action) {
      this.props.action()
    }
  }
}

export class ForwardArrowComponent extends BaseComponent<{
  action?: ()=>void
}> {
  template = /*html*/ `
    <div @click="handleClick" class="ml-5 cursor-pointer">
      <i class="fa fa-angle-right fa-2x"></i>
    </div>
  `
  handleClick() {
    if (this.props.action) {
      this.props.action()
    }
  }
}

export class DoubleForwardArrowComponent extends BaseComponent<{
  action?: ()=>void
}> {
  template = /*html*/ `
    <div @click="handleClick" class="ml-5 cursor-pointer">
      <i class="fa fa-angle-double-right fa-2x"></i>
    </div>
  `
  handleClick() {
    if (this.props.action) {
      this.props.action()
    }
  }
}

export class MenuIconComponent extends BaseComponent<{
  action?: ()=>void
}> {
  template = /*html*/ `
    <div @click="handleClick" class="mr-5 cursor-pointer z-50">
      <i class="fa fa-bars fa-lg"></i>
    </div>
  `
  async handleClick() {
    if (this.props.action) {
      this.props.action()
    }
  }
}