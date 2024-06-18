import { avatarList } from "../model/avatar";
import { validatePassword, validateUsername } from "../model/signup-validation";
import { getRequestParam } from "../util/url-utils";
import { BaseComponent } from "./base-component";
import { postSignupRequest, tryToGetExistingUser, tryToGetUser } from "./client-api";

const avatarOptions = avatarList.sort((a,b) => a.desc.localeCompare(b.desc))
avatarOptions.unshift({
  desc: '',
  file: ''
})

export class SignupComponent extends BaseComponent<{}> {
  username = ''
  password = ''
  avatar = ''
  soundEffects = true
  music = true

  avatarOptions = avatarOptions

  template = /*html*/ `
    <div class="container mx-auto px-4" style="max-width: 500px;">
      <div class="mx-auto">
        <form @submit="(e)=>{e.preventDefault(); sendSignupRequest();}" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 mt-3">
          <input type="submit" style="display: none" />
          <h1 class="mt-6 mb-6 text-center text-3xl font-extrabold text-gray-900">
            Sign Up
          </h1>
          <div class="mt-5 mb-4">
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
          </div>
          <div id="avatar-display" class="mt-11">
            <img class="h-28 mx-auto" src="/sprites/trainers/{{avatar ? avatar.toLowerCase() : 'unknown'}}.png">
          </div>
          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
              Avatar
            </label>
            <select $bind="avatar" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="avatar">
              <option $for="option in avatarOptions" :value="option.file">{{option.desc}}</option>
            </select>
          </div>
          <div class="mb-6 flex flex-row justify-around">
            <div>
              <label class="text-gray-700 text-sm font-bold mb-2 mr-2" for="music">
                Music
              </label>
              <input $bind="music" type="checkbox" class="" id="music">
            </div>
            <div>
              <label class="text-gray-700 text-sm font-bold mb-2 mr-2" for="sound_effects">
                Sound Effects
              </label>
              <input $bind="soundEffects" type="checkbox" class="" id="sound_effects">
            </div>
          </div>
          <p class="text-lg ml-1 my-6">Already have an account? <a href="/login{{window.location.search}}" class="underline text-blue-600 hover:text-blue-800 visited:text-purple-600">Log In</a></p>
          <div class="flex items-center justify-center">
            <button @click="sendSignupRequest" class="mr-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
              Sign Up
            </button>
            <button @click="()=>$router.goTo('/')" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `

  async sendSignupRequest() {
    const usernameValidationResult = validateUsername(this.username)
    const passwordValidationResult = validatePassword(this.password)
    if (!usernameValidationResult.isValid) {
      alert(usernameValidationResult.errorText)
    } else if (!passwordValidationResult.isValid) {
      alert(passwordValidationResult.errorText)
    } else if (!this.avatar) {
      alert('Please select an avatar')
    } else {
      const existingUser = await tryToGetExistingUser(this.username)
      if (!existingUser) {
        await postSignupRequest({
          username: this.username,
          password: this.password,
          avatar: this.avatar,
          music: this.music,
          soundEffects: this.soundEffects
        })
        let redirectedFrom = getRequestParam('from')
        document.location.search = ''
        if (redirectedFrom) {
          this.$router.goTo(redirectedFrom)
        } else {
          this.$router.goTo('/')
        }
      } else {
        alert(`Username is already taken.`)
      }
    }
  }
}