const handler = async (m, {conn, isOwner}) => {
  const adv = Object.entries(global.db.data.users).filter((user) => user[1].warn);

  // Imagen de advertencias
  const imagewarn = 'https://qu.ax/knWaA.png';

  let userList = '';
  if (adv.length > 0) {
    userList = adv.map(([jid, user], i) => {
      const username = isOwner ? '@' + jid.split('@')[0] : jid.split('@')[0];
      return `👤 *Usuario:* ${username}\n🔔 *Advertencias:* ${user.warn}/3\n─────────────────`;
    }).join('\n\n');
  } else {
    userList = '✅ *No hay usuarios con advertencias*';
  }

  const caption = `⚠️ *LISTA DE ADVERTENCIAS - KARBOT-MD* ⚠️\n\n` +
                 `📊 *Usuarios advertidos:* ${adv.length}\n\n` +
                 `${userList}\n\n` +
                 `✨ *Sistema de advertencias de KARBOT-MD*`;

  // Enviar mensaje con imagen
  await conn.sendMessage(m.chat, {
    image: { url: imagewarn },
    caption: caption,
    mentions: await conn.parseMention(caption)
  }, {quoted: m});
};

handler.help = ['listwarn'];
handler.tags = ['group'];
handler.command = /^(listwarn|listawarn|advertencias|warns)$/i;
handler.group = true;
handler.admin = true;
export default handler;