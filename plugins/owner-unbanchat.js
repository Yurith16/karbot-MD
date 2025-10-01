const handler = async (m) => {
  global.db.data.chats[m.chat].isBanned = false;

  // Reacción de éxito
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '✅',
        key: m.key
      }
    });
  } catch (reactError) {}

  const message = `
┌──「 ✅ CHAT DESBANEADO 」
│
│ 💬 *Chat:* ${m.chat}
│ 🎯 *Estado:* Desbaneado exitosamente
│ 
│ 🔓 Este chat puede volver a usar el bot
│ 
│ 🤖 ¡Todos los comandos están disponibles!
└──────────────`.trim();

  m.reply(message);
};

handler.help = ['unbanchat'];
handler.tags = ['owner'];
handler.command = /^unbanchat|desbanearchat|activarchat$/i;
handler.rowner = true;

export default handler;