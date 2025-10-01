const ro = 3000;

const handler = async (m, {conn, usedPrefix, command}) => {
  const time = global.db.data.users[m.sender].lastrob + 7200000;
  if (new Date - global.db.data.users[m.sender].lastrob < 7200000) {
    const remainingTime = msToTime(time - new Date());
    throw `🕐 *DEBES ESPERAR*\n\nNo puedes robar de nuevo hasta dentro de:\n⏰ *${remainingTime}*`;
  }

  let who;
  if (m.isGroup) {
    who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
  } else {
    who = m.chat;
  }

  if (!who) throw '❌ *DEBES MENCIONAR A ALGUIEN*\n\nEtiqueta a la persona que quieres robar.';
  if (!(who in global.db.data.users)) throw '❌ *USUARIO NO ENCONTRADO*\n\nEl usuario mencionado no está en la base de datos.';

  const users = global.db.data.users[who];
  const rob = Math.floor(Math.random() * ro);

  if (users.exp < rob) {
    // Reacción para robo fallido
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '😔',
          key: m.key
        }
      });
    } catch (reactError) {}

    return m.reply(`😔 *ROBO FALLIDO*\n\n@${who.split`@`[0]} no tiene suficiente experiencia para robar.\nSolo tiene *${users.exp} XP* disponible.`, null, {mentions: [who]});
  }

  global.db.data.users[m.sender].exp += rob;
  global.db.data.users[who].exp -= rob;

  // Reacción para robo exitoso
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '💰',
        key: m.key
      }
    });
  } catch (reactError) {}

  m.reply(`✅ *ROBO EXITOSO*\n\nHas robado *${rob} XP* de @${who.split`@`[0]}\n\n¡Buena jugada! 😎`, null, {mentions: [who]});
  global.db.data.users[m.sender].lastrob = new Date() * 1;
};

handler.help = ['rob'];
handler.tags = ['xp'];
handler.command = ['robar', 'rob'];

export default handler;

function msToTime(duration) {
  const milliseconds = parseInt((duration % 1000) / 100);
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? '0' + hours : hours;
  minutes = (minutes < 10) ? '0' + minutes : minutes;
  seconds = (seconds < 10) ? '0' + seconds : seconds;

  return hours + ' Hora(s) ' + minutes + ' Minuto(s) ' + seconds + ' Segundo(s)';
}