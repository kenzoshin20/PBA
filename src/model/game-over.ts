import { Battle } from "./battle.js";
import { Player } from "./player.js";
import axios from 'axios';

export async function handleGameOver(winner: Player, loser: Player, battle: Battle) {
  // If the battle already has a winner, exit early
  if (battle.winnerName != null) {
    return;
  }

  // Assign the winner and update battle state
  battle.winnerName = winner.name;
  battle.battleState = 'GAME_OVER';

  // Push game over events
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
    message: `You ${winner.name} defeated ${loser.name}`,
    forPlayerName: winner.name
  });
  battle.events.push({
    type: 'DISPLAY_MESSAGE',
    message: `You ${loser.name} lost against ${winner.name}`, 
    forPlayerName: loser.name
  });

  // Function to send message to a chat room
  async function sendMessageToChatRoom(chatroomId: string, username: string, message: string) {
    const url = `http://158.101.198.227:8534/api/chat?chatroom_id=${encodeURIComponent(chatroomId)}&username=${encodeURIComponent(username)}&message=${encodeURIComponent(message)}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error.message);
    }
  }

  // Example usage of sendMessageToChatRoom
  await sendMessageToChatRoom('pba125', 'SYSTEM', `${winner.name} has defeated ${loser.name}`);

  // Check battle type to determine if database update is needed
  if (battle.battleType === 'MULTI_PLAYER' && battle.battleSubType === 'CHALLENGE') {
    try {
      const url = `http://158.101.198.227:8268/update-records`;
      const response = await axios.post(url, {
        winner: winner.name,
        loser: loser.name
      });

      console.log('Database updated successfully:', response.data);
    } catch (error) {
      console.error('Error updating database:', error);
    }
  }
    }
