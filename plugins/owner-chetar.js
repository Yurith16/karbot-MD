const handler = async (m, { conn }) => {
  const user = global.db.data.users[m.sender];

  // Reacción de cheat
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '⚡',
        key: m.key
      }
    });
  } catch (reactError) {}

  // Aplicar recursos infinitos
  user.money = Infinity;
  user.limit = Infinity;
  user.level = Infinity;
  user.exp = Infinity;

  const cheatMessage = `⚡ *RECURSOS ILIMITADOS ACTIVADOS*\n\n👤 *Usuario:* @${m.sender.split('@')[0]}\n\n💰 *Dinero:* ∞\n💎 *Diamantes:* ∞\n⭐ *Experiencia:* ∞\n🎯 *Nivel:* ∞\n\n¡Ahora tienes recursos infinitos! 🚀`;

  conn.sendMessage(m.chat, {
    text: cheatMessage, 
    mentions: [m.sender]
  }, { quoted: m });
};

handler.help = ['cheat'];
handler.tags = ['owner'];
handler.command = /^(ilimitado|infinity|infinito|chetar|cheat|recursosinfinitos)$/i;
handler.rowner = true;
handler.fail = null;

export default handler;