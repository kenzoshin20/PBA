import { getRequestParam } from "../util/url-utils";
import { BaseComponent } from "./base-component";
import { postLoginRequest } from "./client-api";

export class LoginComponent extends BaseComponent<{}> {
  username = ''
  password = ''
  template = /*html*/ `
    <div class="container mx-auto px-4" style="max-width: 500px;">
      <div class="mx-auto">
        <form @submit="(e)=>{e.preventDefault(); sendLoginRequest();}" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 mt-3">
          <input type="submit" style="display: none" />
          <h1 class="mt-6 mb-6 text-center text-3xl font-extrabold text-gray-900">
            Log In
          </h1>
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
              Username
            </label>
            <input $bind="username" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text">
          </div>
          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
              Password
            </label>
            <input $bind="password" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password">
            <p class="text-lg ml-1 my-6">Need an account? <a href="/signup{{window.location.search}}" class="underline text-blue-600 hover:text-blue-800 visited:text-purple-600">Sign Up</a></p>
          </div>
          <div class="flex items-center justify-center">
            <button @click="sendLoginRequest" class="mr-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
              Log In
            </button>
            <button @click="()=>$router.goTo('/')" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `

  async sendLoginRequest() {
    await postLoginRequest({
      username: this.username,
      password: this.password
    })
    let redirectedFrom = getRequestParam('from')
    document.location.search = ''
    if (redirectedFrom) {
      this.$router.goTo(redirectedFrom)
    } else {
      this.$router.goTo('/')
    }
  }
}