import { BaseComponent } from "./base-component"

export class WideButtonComponent extends BaseComponent<{
  text: string,
  action: () => void
}> {
  template = /*html*/ `
    <div @click="props.action" class="cursor-pointer flex items-center justify-center h-16 col-span-2 rounded border-2 border-solid border-black mx-1 bg-gray-100">
      <div class="mt-1 text-xl">{{props.text}}</div>
    </div>
  `
}