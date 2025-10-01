const xpperlimit = 350;

const handler = async (m, {conn, command, args}) => {
  let count = command.replace(/^buy/i, '');
  count = count ? /all/i.test(count) ? Math.floor(global.db.data.users[m.sender].exp / xpperlimit) : parseInt(count) : args[0] ? parseInt(args[0]) : 1;
  count = Math.max(1, count);

  const user = global.db.data.users[m.sender];

  if (user.exp >= xpperlimit * count) {
    user.exp -= xpperlimit * count;
    user.limit += count;

    // Sistema de reacción
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '💎',
          key: m.key
        }
      });
    } catch (reactError) {
      // Ignorar error de reacción
    }

    const message = `
╭───「 *✅ COMPRA EXITOSA* 」
│ 🛒 *Artículo:* Diamantes
│ 
│ 📦 *Cantidad:* +${count} 💎
│ 💰 *Costo:* -${xpperlimit * count} XP
│ 
│ 📊 *Nuevo saldo:*
│ ➺ Diamantes: ${user.limit} 💎
│ ➺ Experiencia: ${user.exp} XP
╰───────────────
*🤖 KARBOT-MD*`.trim();

    conn.reply(m.chat, message, m);
  } else {
    const neededXP = (xpperlimit * count) - user.exp;

    // Sistema de reacción para error
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      });
    } catch (reactError) {
      // Ignorar error de reacción
    }

    const errorMessage = `
╭───「 *❌ XP INSUFICIENTE* 」
│ No tienes suficiente experiencia
│ para comprar *${count}* diamantes.
│ 
│ 💰 *Necesitas:* ${xpperlimit * count} XP
│ 📊 *Tienes:* ${user.exp} XP
│ ❌ *Faltan:* ${neededXP} XP
╰───────────────
*🤖 KARBOT-MD*`.trim();

    conn.reply(m.chat, errorMessage, m);
  }
};

handler.help = ['buy', 'buyall'];
handler.tags = ['xp'];
handler.command = ['buy', 'buyall'];
handler.disabled = false;

export default handler;