/* Desarrollado y Creado por: HERNANDEZ - KARBOT-MD */

import MessageType from "baileys";

const handler = async (m, {conn, usedPrefix, command}) => {
  const room = Object.values(conn.game).find((room) => room.id.startsWith('tictactoe') && [room.game.playerX, room.game.playerO].includes(m.sender));

  if (room == undefined) {
    return conn.sendMessage(m.chat, {
      text: `❌ *NO TIENES PARTIDAS ACTIVAS*\n\n🎮 *Para crear una nueva partida usa:*\n*${usedPrefix}ttt @usuario*`,
      mentions: conn.parseMention(`${usedPrefix}ttt @usuario`)
    }, {quoted: m});
  }

  delete conn.game[room.id];
  await m.reply(`✅ *PARTIDA ELIMINADA*\n\n🔄 *La partida de tres en raya ha sido cancelada exitosamente*`);
};

handler.command = /^(delttt|deltt|delxo|deltictactoe)$/i;
handler.fail = null;
export default handler;