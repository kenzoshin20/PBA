// Import necessary modules and types
import { Battle } from "./battle.js";
import { Player } from "./player.js";
import axios from 'axios';

// Define handleGameOver function
export async function handleGameOver(winner: Player, loser: Player, battle: Battle) {
  // Check if battle is already over
  if (battle.winnerName !== null) {
    return;
  }

  // Update battle state
  battle.winnerName = winner.name;
  battle.battleState = 'GAME_OVER';

  // Prepare game over events
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

  // Check if battle subtype is 'CHALLENGE'
  if (battle.battleSubType === 'CHALLENGE') {
    try {
      // Construct URL for database update
      const url = `https://pba-cli.onrender.com/update-records?winner=${encodeURIComponent(winner.name)}&loser=${encodeURIComponent(loser.name)}`;
      
      // Send POST request to update database
      const response = await axios.post(url);
      console.log('Database updated successfully:', response.data);
    } catch (error) {
      console.error('Error updating database:', error);
    }
  }
    }
