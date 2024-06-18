import { Component } from 'nuro'
import { Router } from 'nuro-router';
import { Controller } from "./controller";

export class BaseComponent<Props> extends Component<Props> {
  $controller!: Controller
  $router!: Router
  $element!: HTMLElement
  $update!: (newData: any)=>void
}