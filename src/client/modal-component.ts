import { BaseComponent } from "./base-component";

export class ModalComponent extends BaseComponent<{
  close: ()=>void
  children: unknown
}> {

  template = /*html*/ `
    <div class="fixed z-40 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="min-h-screen pt-4 px-4 pb-40 text-center">

        <!-- Gray background -->
        <div @click="handleClose" class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

        <!-- Content -->
        <div class="inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all my-8 sm:align-middle sm:max-w-min sm:w-full">
          <slot></slot>
        </div>

      </div>
    </div>
  `

  handleClose() {
    if (this.props.close) {
      this.props.close()
    }
  }

}