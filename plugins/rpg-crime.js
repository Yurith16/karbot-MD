let crime = 500
let diamante = 10

const handler = async (m, { conn, usedPrefix, command, groupMetadata, participants, isPrems }) => {
  const date = global.db.data.users[m.sender].crime + 3600000; // 1 hora
  if (new Date - global.db.data.users[m.sender].crime < 3600000) {
    const remainingTime = msToTime(date - new Date());

    // Reacción de espera
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '⏳',
          key: m.key
        }
      });
    } catch (reactError) {}

    return m.reply(`⏳ *DEBES ESPERAR*\n\nPuedes cometer otro crimen en:\n${remainingTime}`);
  }

  let randow
  if (m.isGroup) {
    randow = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
  } else {
    randow = m.chat
  }

  try {
    let ps = groupMetadata.participants.map(v => v.id)
    let randow = ps.getRandom()
    let users = global.db.data.users[randow]

    const exp = Math.floor(Math.random() * 9000)
    const diamond = Math.floor(Math.random() * 150)
    const money = Math.floor(Math.random() * 9000)

    let resultados = ['exito1', 'exito2', 'fracaso1', 'fracaso2', 'robo_usuario'];
    let resultado = resultados[Math.floor(Math.random() * 5)]

    global.db.data.users[m.sender].crime = new Date() * 1;

    // Reacción de crimen
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '🔫',
          key: m.key
        }
      });
    } catch (reactError) {}

    if (resultado === 'exito1') {
      global.db.data.users[m.sender].exp += exp;
      const message = `
┌──「 🎯 CRIMEN EXITOSO 」
│
│ ✅ *¡Crimen exitoso!*
│ 
│ 🎁 *Botín obtenido:*
│ ➺ +${exp} XP
│ 
│ 💰 ¡Buena jugada criminal!
└──────────────`.trim();
      return m.reply(message);
    }

    if (resultado === 'exito2') {
      global.db.data.users[m.sender].limit += diamond;
      global.db.data.users[m.sender].money += money;
      const message = `
┌──「 💎 BOTÍN EXCEPCIONAL 」
│
│ 🎉 *¡Golpe maestro!*
│ 
│ 💰 *Botín obtenido:*
│ ➺ +${diamond} 💎 Diamantes
│ ➺ +${money} 💵 Dinero
│ 
│ 🚀 ¡Eres un profesional!
└──────────────`.trim();
      return m.reply(message);
    }

    if (resultado === 'fracaso1') {
      global.db.data.users[m.sender].exp -= crime;
      const message = `
┌──「 🚓 CRIMEN FALLIDO 」
│
│ ❌ *¡Atrapado por la policía!*
│ 
│ 💸 *Multa:*
│ ➺ -${crime} XP
│ 
│ 😔 Mejor suerte la próxima
└──────────────`.trim();
      return m.reply(message);
    }

    if (resultado === 'fracaso2') {
      global.db.data.users[m.sender].limit -= diamante;
      global.db.data.users[m.sender].money -= crime;
      const message = `
┌──「 💀 DESASTRE TOTAL 」
│
│ 💥 *¡Todo salió mal!*
│ 
│ 📉 *Pérdidas:*
│ ➺ -${diamante} 💎 Diamantes
│ ➺ -${crime} 💵 Dinero
│ 
│ 🏃 ¡Huye mientras puedas!
└──────────────`.trim();
      return m.reply(message);
    }

    if (resultado === 'robo_usuario') {
      global.db.data.users[m.sender].exp += exp;
      global.db.data.users[randow].exp -= crime;
      const message = `
┌──「 👤 ROBO A USUARIO 」
│
│ 🎭 *¡Le robaste a @${randow.split`@`[0]}!*
│ 
│ 💰 *Resultado:*
│ ➺ +${exp} XP para ti
│ ➺ -${crime} XP para la víctima
│ 
│ 😎 ¡Criminal despiadado!
└──────────────`.trim();
      return conn.reply(m.chat, message, m, { 
        contextInfo: { mentionedJid: [randow] } 
      });
    }

  } catch (e) {
    console.log(e);
    // Reacción de error
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      });
    } catch (reactError) {}

    m.reply('❌ *ERROR*\n\nNo se pudo completar el crimen. Intenta nuevamente.');
  }
}

handler.help = ['crime'];
handler.tags = ['xp'];
handler.command = /^(crime|crímen|crimen|robar|asalto)$/i;
handler.register = true;
handler.group = true;

export default handler;

function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

  hours = (hours < 10) ? "0" + hours : hours
  minutes = (minutes < 10) ? "0" + minutes : minutes
  seconds = (seconds < 10) ? "0" + seconds : seconds

  return `${hours}h ${minutes}m ${seconds}s`;
}

