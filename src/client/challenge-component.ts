import { Challenge } from "../model/challenge";
import { logInfo } from "../util/logger";
import { Poller } from "../util/poller";
import { BaseComponent } from "./base-component";
import { getChallenge, postChallengeAccept, tryToGetUser } from "./client-api";
import { TerminalComponent } from "./terminal-component";

export class ChallengeComponent extends BaseComponent<{
  routeParams: {
    challengeId: string;
  };
}> {
  view: 'LOADING' | 'CHALLENGER' | 'RECEIVER' = 'LOADING';
  challenge?: Challenge;
  url?: string;
  showCopiedMsg = false;
  template = /*html*/ `
    <div class="py-3 font-mono container mx-auto px-4" style="max-width: 500px">

      <div $if="view == 'RECEIVER'">
        <img class="h-28 mx-auto mt-10" src="/img/pokemon_logo.png" alt="pokemon"/>
        <h1 class="main-menu text-center text-2xl mt-8 px-4">
          PvP
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
        <img class="h-28 mx-auto mt-10" src="/img/pokemon_logo.png" alt="pokemon"/>
        <h1 class="main-menu text-center text-2xl mt-8 px-4">
          PvP
        </h1>
        <div id="avatar-display" class="mt-5 mb-8">
          <img class="h-32 mx-auto" src="/sprites/trainers/{{challenge.challengerAvatar.toLowerCase()}}.png">
        </div>
        <terminal-component></terminal-component>
        <div class="grid grid-cols-2 gap-1">
          <div @click="shareChallenge" class="ml-1 mt-2 h-16 cursor-pointer bg-gray-100 text-center text-lg pt-3 rounded border-2 border-solid border-black">
            Share
          </div>
          
          <div @click="rejectChallenge" class="mr-1 mt-2 h-16 cursor-pointer bg-gray-100 text-center text-lg pt-3 rounded border-2 border-solid border-black">
            Cancel
          </div>
         
        </div>
        <p class="text-center mt-2">Challenger is waiting for rival...</p>
        <p $if="showCopiedMsg" class="text-center mt-2">Copied!</p>
      </div>

    </div>
  `;
  includes = {
    TerminalComponent
  };

  async beforeMount() {
    const loggedInUser = await tryToGetUser();
    const challengeId = this.props.routeParams.challengeId;
    if (challengeId) {
      this.url = document.location.href;
      this.challenge = await getChallenge(challengeId);
      if (loggedInUser && this.challenge.challengerName === loggedInUser.username) {
        this.view = 'CHALLENGER';
        await this.$controller.publish({
          type: 'DISPLAY_MESSAGE',
          message: `Challenger is waiting for rival...`
        });
        this.poll();
      } else {
        this.view = 'RECEIVER';
        await this.$controller.publish({
          type: 'DISPLAY_MESSAGE',
          message: `${this.challenge?.challengerName} challenged you to a Pokemon battle!`
        });
      }
    } else {
      this.$router.goTo('/');
    }
  }

  async poll() {
    if (this.challenge) {
      const poller = new Poller();
      poller.action = async () => {
        this.challenge = await getChallenge(this.challenge!.challengeId);
      };
      poller.endCondition = async () => {
        return this.challenge?.state === 'ACCEPTED';
      };
      await poller.run();
      this.$router.goTo(`/battle/${this.challenge.battleId}`);
    }
  }

  async acceptChallenge() {
    const challengeId = this.props.routeParams.challengeId;
    if (challengeId) {
      const challenge = await postChallengeAccept(challengeId);
      if (challenge.battleId) {
        this.$router.goTo(`/battle/${challenge.battleId}`);
      } else {
        alert('Failed to accept challenge');
        logInfo('Failed to accept challenge, no battleId');
        logInfo(challenge);
      }
    }
  }

  async rejectChallenge() {
    this.$router.goTo('/');
  }

  async shareChallenge() {
    const challengeId = this.props.routeParams.challengeId;
    if (challengeId) {
      const challengerName = this.challenge?.challengerName;
      const url = `http://158.101.198.227:8268/challenge?challenger=${challengerName}&challenge_id=${challengeId}`;

      try {
        const response = await fetch(url, {
          method: 'POST'
        });

        if (response.ok) {
          // Handle successful sharing of challenge
          await this.$controller.publish({
            type: 'DISPLAY_MESSAGE',
            message: `Challenge shared successfully!`
          });
          this.showCopiedMsg = true;
        } else {
          // Handle error sharing challenge
        /*  await this.$controller.publish({
            type: 'DISPLAY_MESSAGE',
            message: `Failed to share challenge`
          }); */
          console.error('Failed to share challenge:', response.statusText);
        }
      } catch (error) {
        // Handle network or other errors
    /*    console.error('Error sharing challenge:', error);
        await this.$controller.publish({
          type: 'DISPLAY_MESSAGE',
          message: `Error sharing challenge: ${error.message}`
        }); */
      }
    }
  }
}
