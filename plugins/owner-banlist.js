const handler = async (m, {conn, isOwner}) => {
  const chats = Object.entries(global.db.data.chats).filter((chat) => chat[1].isBanned);
  const users = Object.entries(global.db.data.users).filter((user) => user[1].banned);

  // Reacción de lista
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '📋',
        key: m.key
      }
    });
  } catch (reactError) {}

  let caption = `🚫 *LISTA DE BANEOS*\n\n`;

  // Sección de usuarios baneados
  caption += `👤 *USUARIOS BANEADOS*\n`;
  if (users.length > 0) {
    caption += `📊 Total: ${users.length}\n\n`;
    users.forEach(([jid], i) => {
      caption += `▸ @${jid.split('@')[0]}\n`;
    });
  } else {
    caption += `📭 No hay usuarios baneados\n`;
  }

  caption += `\n────────────────\n\n`;

  // Sección de chats baneados
  caption += `💬 *CHATS BANEADOS*\n`;
  if (chats.length > 0) {
    caption += `📊 Total: ${chats.length}\n\n`;
    chats.forEach(([jid], i) => {
      caption += `▸ ${jid}\n`;
    });
  } else {
    caption += `📭 No hay chats baneados\n`;
  }

  caption += `\n────────────────\n`;
  caption += `📝 *Resumen:* ${users.length} usuario(s) y ${chats.length} chat(s) baneados`;

  m.reply(caption, null, {mentions: conn.parseMention(caption)});
};

handler.command = /^banlist(ned)?|ban(ned)?list|daftarban(ned)?|listabaneos|listaban|baneados$/i;
handler.rowner = true;
handler.help = ['banlist'];

export default handler;