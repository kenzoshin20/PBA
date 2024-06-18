import { avatarList } from "../model/avatar";
import { BaseComponent } from "./base-component";
import { getUser, putUser } from "./client-api";

const avatarOptions = avatarList.sort((a,b) => a.desc.localeCompare(b.desc))

export class SettingsComponent extends BaseComponent<{}> {

  avatarOptions = avatarOptions

  loaded = false

  username = ''
  avatar = ''
  soundEffects? = true
  music? = true

  async beforeMount() {
    const user = await getUser()
    this.$update({
      username: user.username,
      avatar: user.avatar,
      soundEffects: user.settings?.soundEffects,
      music: user.settings?.music,
      loaded: true
    })

    // Work around for Safari checkbox bug in Nuro
    this.$update({
      soundEffects: user.settings?.soundEffects,
      music: user.settings?.music,
    })
  }

  async update() {
    await putUser(this.username, {
      avatar: this.avatar,
      settings: {
        soundEffects: this.soundEffects,
        music: this.music
      }
    })
    this.$router.goTo('/')
  }

  template = /*html*/ `
    <div class="container mx-auto px-4" style="max-width: 500px;">
      <div $if="loaded" class="mx-auto">
        <form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 mt-3">
          <h1 class="mt-6 mb-6 text-center text-3xl font-extrabold text-gray-900">
            Settings for {{username}}
          </h1>
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
          <div class="flex items-center justify-center">
            <button @click="update" class="mr-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
              Save
            </button>
            <button @click="()=>$router.goTo('/logout')" class="mr-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
              Log Out
            </button>
            <button @click="()=>$router.goTo('/')" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `
}