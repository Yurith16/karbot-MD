const handler = async (m, {usedPrefix}) => {
  let who;
  if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.sender;
  else who = m.sender;

  const name = conn.getName(who);
  const user = global.db.data.users[who];

  // Reacción de balance
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '💎',
        key: m.key
      }
    });
  } catch (reactError) {}

  const balanceMessage = `
┌──「 💎 BALANCE DE DIAMANTES 」
│
│ 👤 *Usuario:* ${name}
│ 
│ 💰 *Recursos disponibles:*
│ ➺ ${user.limit} 💎 Diamantes
│ ➺ ${user.money || 0} 💵 Dinero  
│ ➺ ${user.exp || 0} ⭐ Experiencia
│ ➺ ${user.potion || 0} 🥤 Pociones
│
│ 🛒 *Comandos útiles:*
│ ➺ ${usedPrefix}buy [cantidad]
│ ➺ ${usedPrefix}buyall
│
│ 💫 ¡Sigue acumulando riquezas!
└──────────────`.trim();

  m.reply(balanceMessage);
};

handler.help = ['bal'];
handler.tags = ['xp'];
handler.command = ['bal', 'diamantes', 'diamond', 'balance', 'saldo', 'dinero'];

export default handler;