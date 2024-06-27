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

  const sendMessageToChatRoom = async (chatroomId, username, message) => {
    const url = `http://localhost:8534/api/chat`;

    try {
      const response = await axios.post(url, {
        chatroom_id: chatroomId,
        username: username,
        message: message
      });

      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error.message);
    }
  };

  // Example usage:
  sendMessageToChatRoom('pba125', 'SYSTEM', `${winner.name} has Defeated ${loser.name}`);

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