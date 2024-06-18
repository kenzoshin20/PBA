import { Type } from "../model/type";
import { BaseComponent } from "./base-component";
import { TYPE_COLORS } from "./type-colors";

export class TypeCardComponent extends BaseComponent<{
  type: Type
}> {
  template = /*html*/ `
    <div 
    style="background-color: {{getBgColor(props.type)}};" 
    class="text-xs rounded text-white text-center p-1 w-20 border border-solid border-gray-500"
    >
      {{props.type}}
    </div>
  `
  getBgColor(type: Type) {
    return TYPE_COLORS[type]
  }
}