import { canLevelUp, xpRange } from '../src/libraries/levelling.js';
import { levelup } from '../src/libraries/canvas.js';

const handler = async (m, { conn }) => {
  const name = conn.getName(m.sender);
  const usertag = '@' + m.sender.split('@s.whatsapp.net')[0];
  const user = global.db.data.users[m.sender];

  if (!canLevelUp(user.level, user.exp, global.multiplier)) {
    const { min, xp, max } = xpRange(user.level, global.multiplier);
    const message = `
┌──「 📊 NIVEL ACTUAL 」
│
│ ⭐ *Usuario:* ${usertag}
│ 
│ 🎯 *Nivel:* ${user.level}
│ 👑 *Rango:* ${user.role}
│ 
│ 📈 *Progreso:* ${user.exp - min}/${xp} XP
│ 🎯 *Faltan:* ${max - user.exp} XP
│ 
│ 💪 ¡Sigue avanzando!
└──────────────`.trim();

    // Reacción para nivel actual
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '📊',
          key: m.key
        }
      });
    } catch (reactError) {}

    return conn.sendMessage(m.chat, {text: message, mentions: [m.sender]}, {quoted: m});
  }

  const before = user.level * 1;
  while (canLevelUp(user.level, user.exp, global.multiplier)) user.level++;

  if (before !== user.level) {
    const levelUpMessage = `🎉 ¡Felicidades ${name}! Has subido al nivel ${user.level}`;
    const levelUpDetails = `
┌──「 🎉 SUBISTE DE NIVEL 」
│
│ ⭐ *Usuario:* ${name}
│ 
│ 📈 *Progreso:*
│ ➺ Nivel anterior: ${before}
│ ➺ Nuevo nivel: ${user.level}
│ ➺ Nuevo rango: ${user.role}
│ 
│ 🎯 *¡Sigue así!*
└──────────────`.trim();

    // Reacción para subida de nivel
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '🎉',
          key: m.key
        }
      });
    } catch (reactError) {}

    try {
      const levelUpImage = await levelup(levelUpMessage, user.level);
      conn.sendFile(m.chat, levelUpImage, 'levelup.jpg', levelUpDetails, m);
    } catch (e) {
      conn.sendMessage(m.chat, {text: levelUpDetails, mentions: [m.sender]}, {quoted: m});
    }
  }
};

handler.help = ['levelup'];
handler.tags = ['xp'];
handler.command = ['nivel', 'lvl', 'levelup', 'level'];

export default handler;