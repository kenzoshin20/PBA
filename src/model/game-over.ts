import { Battle } from "./battle.js";
import { Player } from "./player.js";
import axios from 'axios';

export async function handleGameOver(winner: Player, loser: Player, battle: Battle) {
  if (battle.winnerName != null) {
    return;
  }

  battle.winnerName = winner.name;
  battle.battleState = 'GAME_OVER';

  battle.events.push({
    type: 'SOUND_EFFECT',
    fileName: 'victory.mp3',
    soundType: 'MUSIC',
    forPlayerName: winner.name
  });
  battle.events.push({
    type: 'SOUND_EFFECT',
    fileName: '',
    soundType: 'MUSIC',
    forPlayerName: loser.name,
    stopMusic: true
  });
  battle.events.push({
    type: 'DISPLAY_MESSAGE',
    message: `You ${winner.name} Defeated ${loser.name}`,
    forPlayerName: winner.name
  });
  battle.events.push({
    type: 'DISPLAY_MESSAGE',
    message: `You ${loser.name} Lost against ${winner.name}`, 
    forPlayerName: loser.name
  });

  // Check battle type to determine if database update is needed
  if (battle.battleType === 'MULTI_PLAYER' && battle.battleSubType === 'CHALLENGE') {
    try {
      const url = `https://pba-cli.onrender.com/update-records?winner=${encodeURIComponent(winner.name)}&loser=${encodeURIComponent(loser.name)}`;
      const response = await axios.post(url);
      console.log('Database updated successfully:', response.data);
    } catch (error) {
      console.error('Error updating database:', error);
    }
  }
    }
