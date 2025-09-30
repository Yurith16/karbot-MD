const handler = async (m, {conn, participants, groupMetadata}) => {
  try {
    // Obtener imagen de perfil del grupo con manejo de errores
    let pp;
    try {
      pp = await conn.profilePictureUrl(m.chat, 'image');
    } catch (error) {
      pp = 'https://qu.ax/LOiXu.png'; // Imagen por defecto
    }

    const {antiToxic, antiTraba, antidelete, antiviewonce, isBanned, welcome, detect, detect2, sWelcome, sBye, sPromote, sDemote, antiLink, antiLink2, modohorny, autosticker, modoadmin, audios, delete: del} = global.db.data.chats[m.chat];
    const groupAdmins = participants.filter((p) => p.admin);
    const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n');

    // Obtener owner de forma segura
    const owner = groupMetadata.owner || groupMetadata.ownerJid || groupAdmins.find((p) => p.admin === 'superadmin')?.id || m.chat.split`-`[0] + '@s.whatsapp.net';

    const text = `
🏷️ *INFORMACIÓN DEL GRUPO - KARBOT-MD* 🏷️

📋 *ID del Grupo:* 
${groupMetadata.id}

👥 *Nombre del Grupo:*
${groupMetadata.subject}

📝 *Descripción:*
${groupMetadata.desc?.toString() || 'Sin descripción'}

👥 *Miembros:*
${participants.length} participantes

👑 *Propietario:* 
@${owner.split('@')[0]}

🔧 *Administradores:* 
${listAdmin}

⚙️ *CONFIGURACIONES DEL GRUPO:*

🎉 Bienvenida: ${welcome ? '✅' : '❌'}
🔍 Detección: ${detect ? '✅' : '❌'} 
🔎 Detección 2: ${detect2 ? '✅' : '❌'} 
🔗 Anti-Link: ${antiLink ? '✅' : '❌'} 
🔗 Anti-Link 2: ${antiLink2 ? '✅' : '❌'} 
🔞 Modo Horny: ${modohorny ? '✅' : '❌'} 
🖼️ Auto-Sticker: ${autosticker ? '✅' : '❌'} 
🎵 Audios: ${audios ? '✅' : '❌'} 
👀 Anti-ViewOnce: ${antiviewonce ? '✅' : '❌'} 
🗑️ Anti-Delete: ${antidelete ? '✅' : '❌'} 
🚫 Anti-Tóxico: ${antiToxic ? '✅' : '❌'} 
🛡️ Anti-Traba: ${antiTraba ? '✅' : '❌'} 
👑 Modo Admin: ${modoadmin ? '✅' : '❌'} 

✨ *Información generada por KARBOT-MD*
`.trim();

    // Enviar mensaje con manejo de errores en menciones
    const mentions = [...groupAdmins.map((v) => v.id), owner].filter(id => id);

    conn.sendFile(m.chat, pp, 'karbot-groupinfo.jpg', text, m, false, {
      mentions: mentions
    });

  } catch (error) {
    console.error('Error en infogroup:', error);
    conn.reply(m.chat, 
      `❌ *ERROR AL OBTENER INFORMACIÓN*\n\n` +
      `💡 El grupo podría tener configuración privada\n` +
      `✨ *KARBOT-MD*`,
    m);
  }
};

handler.help = ['infogrup'];
handler.tags = ['group'];
handler.command = /^(infogrupo|gro?upinfo|info(gro?up|gc)|grupoinfo|infogc)$/i;
handler.group = true;
export default handler;