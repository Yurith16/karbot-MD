const handler = async (m, {conn, args}) => {
  const user = global.db.data.users[m.sender];

  if (user.health >= 100) {
    // Reacción para salud llena
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '❤️',
          key: m.key
        }
      });
    } catch (reactError) {}

    return conn.reply(m.chat, `*❤️ SALUD COMPLETA*\n\nTu salud ya está al máximo: *${user.health} HP*`, m);
  }

  const heal = 40 + (user.cat * 4);
  const count = Math.max(1, Math.min(Number.MAX_SAFE_INTEGER, 
    (isNumber(args[0]) && parseInt(args[0]) || Math.round((90 - user.health) / heal)))) * 1;

  if (user.potion < count) {
    // Reacción para pociones insuficientes
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      });
    } catch (reactError) {}

    const message = `
┌──「 🥤 POCIONES INSUFICIENTES 」
│
│ ❌ *No tienes suficientes pociones*
│
│ 📊 *Necesitas:* ${count} pociones
│ 📦 *Tienes:* ${user.potion} pociones
│ ❤️ *Salud actual:* ${user.health} HP
│
│ 💰 *Faltan:* ${count - user.potion} pociones
└──────────────`.trim();

    return conn.reply(m.chat, message, m);
  }

  user.potion -= count * 1;
  user.health += heal * count;

  // Reacción para curación exitosa
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '💚',
        key: m.key
      }
    });
  } catch (reactError) {}

  const message = `
┌──「 💚 CURACIÓN EXITOSA 」
│
│ ✅ *Usaste:* ${count} pociones
│ ❤️ *Salud recuperada:* +${heal * count} HP
│ 💚 *Salud actual:* ${user.health} HP
│ 📦 *Pociones restantes:* ${user.potion}
│
│ 🎯 *¡Listo para la aventura!*
└──────────────`.trim();

  conn.reply(m.chat, message, m);
};

handler.help = ['heal'];
handler.tags = ['xp'];
handler.command = /^(heal|curar|curarse|sanar)$/i;

export default handler;

function isNumber(number) {
  if (!number) return number;
  number = parseInt(number);
  return typeof number == 'number' && !isNaN(number);
}