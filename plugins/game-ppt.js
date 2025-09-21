/* Desarrollado y Creado por: HERNANDEZ - KARBOT-MD */

const handler = async (m, {conn, text, command, usedPrefix, args}) => {
  const pp = 'https://telegra.ph/file/c7924bf0e0d839290cc51.jpg';

  // 10000 = 10 segundos de espera
  const time = global.db.data.users[m.sender].wait + 10000;
  if (new Date - global.db.data.users[m.sender].wait < 10000) {
    throw `⏰ *DEBES ESPERAR* ${Math.floor((time - new Date()) / 1000)} *SEGUNDOS*`;
  }

  if (!args[0]) {
    return conn.reply(m.chat, 
      `🎮 *PIEDRA, PAPEL O TIJERA - KARBOT-MD*\n\n` +
      `*Opciónes disponibles:*\n` +
      `• ${usedPrefix + command} piedra 🗿\n` +
      `• ${usedPrefix + command} papel 📄\n` +
      `• ${usedPrefix + command} tijera ✂️\n\n` +
      `*Elige tu jugada!*`, 
    m);
  }

  let astro = Math.random();
  if (astro < 0.34) {
    astro = 'piedra';
  } else if (astro > 0.34 && astro < 0.67) {
    astro = 'tijera';
  } else {
    astro = 'papel';
  }

  const textm = text.toLowerCase();
  const emojis = {
    piedra: '🗿',
    papel: '📄', 
    tijera: '✂️'
  };

  if (textm == astro) {
    global.db.data.users[m.sender].exp += 500;
    m.reply(
      `⚖️ *¡EMPATE!*\n\n` +
      `*Tú elegiste:* ${textm} ${emojis[textm]}\n` +
      `*Karbot eligió:* ${astro} ${emojis[astro]}\n\n` +
      `✨ *+500 XP*`
    );
  } else if (textm == 'papel') {
    if (astro == 'piedra') {
      global.db.data.users[m.sender].exp += 1000;
      m.reply(
        `🏆 *¡GANASTE!*\n\n` +
        `*Tú elegiste:* ${textm} ${emojis[textm]}\n` +
        `*Karbot eligió:* ${astro} ${emojis[astro]}\n` +
        `📄 *envuelve* 🗿\n\n` +
        `✨ *+1000 XP*`
      );
    } else {
      global.db.data.users[m.sender].exp -= 300;
      m.reply(
        `💥 *¡PERDISTE!*\n\n` +
        `*Tú elegiste:* ${textm} ${emojis[textm]}\n` +
        `*Karbot eligió:* ${astro} ${emojis[astro]}\n` +
        `✂️ *corta* 📄\n\n` +
        `📉 *-300 XP*`
      );
    }
  } else if (textm == 'tijera') {
    if (astro == 'papel') {
      global.db.data.users[m.sender].exp += 1000;
      m.reply(
        `🏆 *¡GANASTE!*\n\n` +
        `*Tú elegiste:* ${textm} ${emojis[textm]}\n` +
        `*Karbot eligió:* ${astro} ${emojis[astro]}\n` +
        `✂️ *corta* 📄\n\n` +
        `✨ *+1000 XP*`
      );
    } else {
      global.db.data.users[m.sender].exp -= 300;
      m.reply(
        `💥 *¡PERDISTE!*\n\n` +
        `*Tú elegiste:* ${textm} ${emojis[textm]}\n` +
        `*Karbot eligió:* ${astro} ${emojis[astro]}\n` +
        `🗿 *rompe* ✂️\n\n` +
        `📉 *-300 XP*`
      );
    }
  } else if (textm == 'piedra') {
    if (astro == 'tijera') {
      global.db.data.users[m.sender].exp += 1000;
      m.reply(
        `🏆 *¡GANASTE!*\n\n` +
        `*Tú elegiste:* ${textm} ${emojis[textm]}\n` +
        `*Karbot eligió:* ${astro} ${emojis[astro]}\n` +
        `🗿 *rompe* ✂️\n\n` +
        `✨ *+1000 XP*`
      );
    } else {
      global.db.data.users[m.sender].exp -= 300;
      m.reply(
        `💥 *¡PERDISTE!*\n\n` +
        `*Tú elegiste:* ${textm} ${emojis[textm]}\n` +
        `*Karbot eligió:* ${astro} ${emojis[astro]}\n` +
        `📄 *envuelve* 🗿\n\n` +
        `📉 *-300 XP*`
      );
    }
  } else {
    m.reply(
      `❌ *JUGADA NO VÁLIDA*\n\n` +
      `*Opciones válidas:* piedra, papel, tijera`
    );
  }

  global.db.data.users[m.sender].wait = new Date * 1;
};

handler.help = ['ppt'];
handler.tags = ['game'];
handler.command = /^(ppt|piedrapapeltijera)$/i;
export default handler;