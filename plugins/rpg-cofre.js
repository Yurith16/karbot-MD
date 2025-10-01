const handler = async (m, {conn}) => {
  const time = global.db.data.users[m.sender].lastcofre + 86400000; // 24 Horas
  if (new Date - global.db.data.users[m.sender].lastcofre < 86400000) {
    const remainingTime = msToTime(time - new Date());

    // Reacción de espera
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '⏳',
          key: m.key
        }
      });
    } catch (reactError) {}

    throw `⏳ *COFRE EN ENFRIAMIENTO*\n\nPuedes abrir otro cofre en:\n${remainingTime}`;
  }

  const dia = Math.floor(Math.random() * 30);
  const tok = Math.floor(Math.random() * 10);
  const mystic = Math.floor(Math.random() * 4000);
  const expp = Math.floor(Math.random() * 5000);

  global.db.data.users[m.sender].limit += dia;
  global.db.data.users[m.sender].money += mystic;
  global.db.data.users[m.sender].joincount += tok;
  global.db.data.users[m.sender].exp += expp;

  // Reacción de cofre abierto
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '🎁',
        key: m.key
      }
    });
  } catch (reactError) {}

  const texto = `
┌──「 💎 COFRE DEL TESORO 」
│
│ 🎉 *¡Cofre abierto con éxito!*
│ 
│ 📦 *Tesoros encontrados:*
│ ➺ ${dia} 💎 Diamantes
│ ➺ ${tok} 🎫 Tickets
│ ➺ ${mystic} 💰 Dinero
│ ➺ ${expp} ⭐ Experiencia
│ 
│ 🏆 ¡Tesoro legendario obtenido!
└──────────────`.trim();

  await conn.reply(m.chat, texto, m);
  global.db.data.users[m.sender].lastcofre = new Date() * 1;
};

handler.help = ['cofre'];
handler.tags = ['xp'];
handler.command = ['coffer', 'cofre', 'abrircofre', 'cofreabrir', 'tesoro'];
handler.level = 5;

export default handler;

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? '0' + hours : hours;
  minutes = (minutes < 10) ? '0' + minutes : minutes;
  seconds = (seconds < 10) ? '0' + seconds : seconds;

  return `${hours}h ${minutes}m ${seconds}s`;
}