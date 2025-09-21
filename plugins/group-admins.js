const handler = async (m, { conn, participants, groupMetadata, args }) => {
  try {
    const pp = await conn.profilePictureUrl(m.chat, 'image').catch((_) => null) || 'https://qu.ax/FvRqo.png';
    const groupAdmins = participants.filter((p) => p.admin);
    const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.jid.split('@s.whatsapp.net')[0]}`).join('\n');
    const owner = groupMetadata.owner || groupAdmins.find((p) => p.admin === 'superadmin')?.jid || m.chat.split`-`[0] + '@s.whatsapp.net';
    const message = args.join(` `);

    const body = `👑 *ADMINISTRADORES DEL GRUPO* 👑\n\n` +
                `${message ? `📢 *Anuncio:* ${message}\n\n` : ''}` +
                `🔰 *Lista de administradores:*\n${listAdmin}\n\n` +
                `⚡ *Total de admins:* ${groupAdmins.length}\n` +
                `✨ *Gestión por KARBOT-MD*`;

    conn.sendFile(m.chat, pp, 'karbot-admins.jpg', body, m, false, { 
      mentions: [...groupAdmins.map((v) => v.jid), owner] 
    });

  } catch (error) {
    console.error(error);
    m.reply('❌ *ERROR AL MOSTRAR LA LISTA DE ADMINS*');
  }
};

handler.help = ["admins"];
handler.tags = ["group"];
handler.command = ["admins", "staff", "administradores", "adm"];
handler.group = true;

export default handler;
