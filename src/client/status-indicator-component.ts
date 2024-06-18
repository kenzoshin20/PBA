import { NonVolatileStatusCondition } from "../model/status-conditions";
import { BaseComponent } from "./base-component";

export class StatusIndicatorComponent extends BaseComponent<{
  condition: NonVolatileStatusCondition
}> {

  displayValues: Record<NonVolatileStatusCondition, { text: string, bgColor: string }> = {
    'BURNED': {text: 'BRN', bgColor: '#EE8130'},
    'ASLEEP': {text: 'SLP', bgColor: '#bfbfbf'},
    'PARALYZED': {text: 'PAR', bgColor: '#F7D02C'},
    'FROZEN': {text: 'FRZ', bgColor: '#96D9D6'},
    'POISONED': {text: 'PSN', bgColor: '#A33EA1'},
    'BADLY POISONED': {text: 'PSN', bgColor: '#330066'},
  }

  template = /*html*/ `
    <span style="background-color: {{displayValues[props.condition].bgColor}}" class="text-white rounded-lg py-1 px-2 border-black border-solid uppercase text-sm">
      {{displayValues[props.condition].text}}
    </span>
  `
}