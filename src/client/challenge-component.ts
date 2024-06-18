import { Challenge } from "../model/challenge";
import { logInfo } from "../util/logger";
import { Poller } from "../util/poller";
import { BaseComponent } from "./base-component";
import { getChallenge, postChallengeAccept, tryToGetUser } from "./client-api";
import { TerminalComponent } from "./terminal-component";

export class ChallengeComponent extends BaseComponent<{
  routeParams: {
    challengeId: string
  }
}> {
  view: 'LOADING' | 'CHALLENGER' | 'RECEIVER' = 'LOADING'
  challenge?: Challenge
  url?: string
  showCopiedMsg = false
  template = /*html*/ `
    <div class="py-3 font-mono container mx-auto px-4" style="max-width: 500px">

      <div $if="view == 'RECEIVER'">
        <img class="h-28 mx-auto mt-10" src="/img/pokemon_logo.png" alt="pokemon"/>
        <h1 class="main-menu text-center text-2xl mt-8 px-4">
          BATTLE ARENA
        </h1>
        <div id="avatar-display" class="mt-5 mb-8">
          <img class="h-32 mx-auto" src="/sprites/trainers/{{challenge.challengerAvatar.toLowerCase()}}.png">
        </div>
        <terminal-component></terminal-component>
        <div class="grid grid-cols-2 gap-1">
          <div @click="acceptChallenge" class="ml-1 mt-2 h-16 cursor-pointer bg-gray-100 text-center text-lg pt-3 rounded border-2 border-solid border-black">
            Accept
          </div>
          <div @click="rejectChallenge" class="mr-1 mt-2 h-16 cursor-pointer bg-gray-100 text-center text-lg pt-3 rounded border-2 border-solid border-black">
            Reject
          </div>
        </div>
      </div>


      <div $if="view == 'CHALLENGER'">
        <h1 class="text-center text-xl m-2">CHALLENGE A FRIEND</h1>
        <h2 class="text-center text-lg mt-5 cursor-pointer">Challenge ID: {{props.routeParams.challengeId}}</h2>
        <p class="text-center mt-5">Send this URL to a friend to challenge them to a Pokemon battle!</p>
        <p class="text-center mt-5">You can click the URL below to copy it to your clipboard:</p>
        <p class="text-center cursor-pointer text-blue-600" @click="copyUrl">{{url}}</p>
        <p $if="showCopiedMsg" class="text-center">Copied!</p>
        <p class="text-center mt-5">After they accept this page will reload and start the battle automatically.</p>
         <p class="text-center mt-5">Join to PBA - Official GC for more friends</p>
        <a class="text-center mt-5" href="https://m.me/j/AbaX1xsn4_O14atW/">https://m.me/j/AbaX1xsn4_O14atW/</a>
      </div>

    </div>
  `
  includes = {
    TerminalComponent
  }
  async beforeMount() {
    const loggedInUser = await tryToGetUser()
    const challengeId = this.props.routeParams.challengeId
    if (challengeId) {
      this.url = document.location.href
      this.challenge = await getChallenge(challengeId)
      if (loggedInUser && this.challenge.challengerName === loggedInUser.username) {
        this.view = 'CHALLENGER'
        this.poll()
      } else {
        this.view = 'RECEIVER'
        await this.$controller.publish({
          type: 'DISPLAY_MESSAGE',
          message: `${this.challenge?.challengerName} challenged you to a Pokemon battle!`
        })
      }
    } else {
      this.$router.goTo('/')
    }
  }

  async poll() {
    if (this.challenge) {
      const poller = new Poller()
      poller.action = async () => {
        this.challenge = await getChallenge(this.challenge!.challengeId)
      }
      poller.endCondition = async () => {
        return this.challenge?.state === 'ACCEPTED'
      }
      await poller.run()
      this.$router.goTo(`/battle/${this.challenge.battleId}`)
    }
  }

  async acceptChallenge() {
    const challengeId = this.props.routeParams.challengeId
    if (challengeId) {
      const challenge = await postChallengeAccept(challengeId)
      if (challenge.battleId) {
        this.$router.goTo(`/battle/${challenge.battleId}`)
      } else {
        alert('Failed to accept challenge')
        logInfo('Failed to accept challenge, no battleId');
        logInfo(challenge);
      }
    }
  }

  rejectChallenge() {
    this.$router.goTo('/')
  }

  copyUrl() {
    var dummy = document.createElement('input'),
    text = window.location.href;
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
    this.showCopiedMsg = true
  }
  
        }
