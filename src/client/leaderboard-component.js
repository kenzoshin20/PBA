import { BaseComponent } from './base-component';
import { getLeaderboard } from './client-api';

export class LeaderboardComponent extends BaseComponent<{}> {
  leaderboard = [];

  template = /*html*/ `
    <div class="leaderboard">
      <h2 class="text-center text-2xl mt-8 px-4">Leaderboard</h2>
      <ul>
        <li $for="user in leaderboard">
          <span>{{user.username}}: {{user.points}} points</span>
        </li>
      </ul>
      <main-menu-button-component text="BACK" route="/"></main-menu-button-component>
    </div>
  `;

  includes = {
    MainMenuButtonComponent
  };

  async beforeMount() {
    try {
      this.leaderboard = await getLeaderboard();
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  }
}