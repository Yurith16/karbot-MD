import TicTacToe from '../src/libraries/tictactoe.js';

const handler = async (m, {conn, usedPrefix, command, text}) => {
  conn.game = conn.game ? conn.game : {};

  if (Object.values(conn.game).find((room) => room.id.startsWith('tictactoe') && [room.game.playerX, room.game.playerO].includes(m.sender))) {
    throw `🎮 *YA ESTÁS EN UNA PARTIDA*`;
  }

  if (!text) throw `❌ *DEBES ESPECIFICAR UNA SALA*\n*Ejemplo:* ${usedPrefix + command} sala1`;

  let room = Object.values(conn.game).find((room) => room.state === 'WAITING' && (text ? room.name === text : true));

  if (room) {
    await m.reply(`✅ *UNIÉNDOTE A LA SALA...*`);
    room.o = m.chat;
    room.game.playerO = m.sender;
    room.state = 'PLAYING';

    const arr = room.game.render().map((v) => {
      return {
        X: '❌',
        O: '⭕',
        1: '1️⃣',
        2: '2️⃣',
        3: '3️⃣',
        4: '4️⃣',
        5: '5️⃣',
        6: '6️⃣',
        7: '7️⃣',
        8: '8️⃣',
        9: '9️⃣',
      }[v];
    });

    const str = `
🎯 *TRES EN RAYA - KARBOT-MD* 🎯

❌ *Jugador X:* @${room.game.playerX.split('@')[0]}
⭕ *Jugador O:* @${room.game.playerO.split('@')[0]}

        ${arr.slice(0, 3).join('')}
        ${arr.slice(3, 6).join('')}
        ${arr.slice(6).join('')}

🎮 *Turno de:* @${room.game.currentTurn.split('@')[0]}`.trim();

    if (room.x !== room.o) await conn.sendMessage(room.x, {text: str, mentions: conn.parseMention(str)}, {quoted: m});
    await conn.sendMessage(room.o, {text: str, mentions: conn.parseMention(str)}, {quoted: m});

  } else {
    room = {
      id: 'tictactoe-' + (+new Date),
      x: m.chat,
      o: '',
      game: new TicTacToe(m.sender, 'o'),
      state: 'WAITING'
    };

    if (text) room.name = text;

    conn.reply(m.chat, 
      `🎮 *CREANDO SALA DE TRES EN RAYA*\n\n` +
      `🏠 *Sala:* ${text}\n` +
      `⏰ *Para eliminar:* ${usedPrefix}delttt\n\n` +
      `👥 *Esperando segundo jugador...*\n` +
      `*Únete con:* ${usedPrefix + command} ${text}`,
    m);

    conn.game[room.id] = room;
  }
};

handler.command = /^(tictactoe|ttc|ttt|xo|3enraya)$/i;
export default handler;
