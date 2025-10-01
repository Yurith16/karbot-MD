const handler = async (m, {conn, text, usedPrefix, command}) => {
  let who;
  if (m.isGroup) who = await await m.mentionedJid[0] ? await await m.mentionedJid[0] : m.quoted ? await m?.quoted?.sender : false;
  else who = m.chat;
  const textpremERROR = `❌ *DEBES MENCIONAR UN USUARIO*\n\n*${usedPrefix + command} @${m.sender.split`@`[0]} 1*\n*${usedPrefix + command} 1 (respondiendo a un mensaje)*`;
  if (!who) return m.reply(textpremERROR, null, {mentions: conn.parseMention(textpremERROR)});

  const user = global.db.data.users[who];
  const txt = text.replace('@' + who.split`@`[0], '').trim();
  const name = await '@' + who.split`@`[0];

  const ERROR = `❌ *USUARIO NO ENCONTRADO*\n\n${'@' + who.split`@`[0]} no está registrado en la base de datos.`;
  if (!user) return m.reply(ERROR, null, {mentions: conn.parseMention(ERROR)});

  const segundos10 = 10 * 1000;
  const hora1 = 60 * 60 * 1000 * txt;
  const dia1 = 24 * hora1 * txt;
  const semana1 = 7 * dia1 * txt;
  const mes1 = 30 * dia1 * txt;
  const now = Date.now();

  // Reacción de proceso
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '⭐',
        key: m.key
      }
    });
  } catch (reactError) {}

  if (command == 'addprem' || command == 'userpremium') {
    if (now < user.premiumTime) user.premiumTime += hora1;
    else user.premiumTime = now + hora1;
    user.premium = true;
    const timeLeft = (user.premiumTime - now) / 1000;
    const textprem1 = `⭐ *USUARIO PREMIUM AGREGADO*\n\n👤 *Usuario:* ${name}\n⏰ *Duración:* ${txt} hora(s)\n⏳ *Tiempo restante:* ${timeLeft} segundos\n\n¡Ahora es usuario premium! 🎉`;
    m.reply(textprem1, null, {mentions: conn.parseMention(textprem1)});
  }

  if (command == 'addprem2' || command == 'userpremium2') {
    if (now < user.premiumTime) user.premiumTime += dia1;
    else user.premiumTime = now + dia1;
    user.premium = true;
    const timeLeft = (user.premiumTime - now) / 1000 / 60 / 60;
    const textprem2 = `⭐ *USUARIO PREMIUM AGREGADO*\n\n👤 *Usuario:* ${name}\n⏰ *Duración:* ${txt} día(s)\n⏳ *Tiempo restante:* ${timeLeft} horas\n\n¡Ahora es usuario premium! 🎉`;
    m.reply(textprem2, null, {mentions: conn.parseMention(textprem2)});
  }

  if (command == 'addprem3' || command == 'userpremium3') {
    if (now < user.premiumTime) user.premiumTime += semana1;
    else user.premiumTime = now + semana1;
    user.premium = true;
    formatTime(user.premiumTime - now).then((timeleft) => {
      const textprem3 = `⭐ *USUARIO PREMIUM AGREGADO*\n\n👤 *Usuario:* ${name}\n⏰ *Duración:* ${txt} semana(s)\n⏳ *Tiempo restante:* ${timeleft}\n\n¡Ahora es usuario premium! 🎉`;
      m.reply(textprem3, null, {mentions: conn.parseMention(textprem3)});
    });
  }

  if (command == 'addprem4' || command == 'userpremium4') {
    if (now < user.premiumTime) user.premiumTime += mes1;
    else user.premiumTime = now + mes1;
    user.premium = true;
    formatTime(user.premiumTime - now).then((timeleft) => {
      const textprem4 = `⭐ *USUARIO PREMIUM AGREGADO*\n\n👤 *Usuario:* ${name}\n⏰ *Duración:* ${txt} mes(es)\n⏳ *Tiempo restante:* ${timeleft}\n\n¡Ahora es usuario premium! 🎉`;
      m.reply(textprem4, null, {mentions: conn.parseMention(textprem4)});
    });
  }
};
handler.help = ['addprem [@user] <days>'];
handler.tags = ['owner'];
handler.command = ['addprem', 'userpremium', 'addprem2', 'userpremium2', 'addprem3', 'userpremium3', 'addprem4', 'userpremium4'];
handler.group = true;
handler.rowner = true;
export default handler;

async function formatTime(ms) {
  let seconds = Math.floor(ms / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  seconds %= 60;
  minutes %= 60;
  hours %= 24;
  let timeString = '';
  if (days) {
    timeString += `${days} día${days > 1 ? 's' : ''} `;
  }
  if (hours) {
    timeString += `${hours} hora${hours > 1 ? 's' : ''} `;
  }
  if (minutes) {
    timeString += `${minutes} minuto${minutes > 1 ? 's' : ''} `;
  }
  if (seconds) {
    timeString += `${seconds} segundo${seconds > 1 ? 's' : ''} `;
  }
  return timeString.trim();
}