const handler = async (m, { conn }) => {
  let txt = '';

  // Reacción de carga
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '📊',
        key: m.key
      }
    });
  } catch (reactError) {}

  try {    
    const groups = Object.entries(conn.chats).filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats);
    const totalGroups = groups.length;

    if (totalGroups === 0) {
      return m.reply('📭 *NO HAY GRUPOS*\n\nEl bot no se encuentra en ningún grupo actualmente.');
    }

    for (let i = 0; i < groups.length; i++) {
      const [jid, chat] = groups[i];
      const groupMetadata = ((conn.chats[jid] || {}).metadata || (await conn.groupMetadata(jid).catch((_) => null))) || {};
      const participants = groupMetadata.participants || [];
      const bot = participants.find((u) => conn.decodeJid(u.id) === conn.user.jid) || {};
      const isBotAdmin = bot?.admin || false;
      const isParticipant = participants.some((u) => conn.decodeJid(u.id) === conn.user.jid);
      const participantStatus = isParticipant ? '✅ En grupo' : '❌ Fuera del grupo';
      const totalParticipants = participants.length;

      let groupName = await conn.getName(jid) || 'Grupo sin nombre';

      txt += `┌──「 🏷️ GRUPO ${i + 1} 」
│ 📝 *Nombre:* ${groupName}
│ 🔗 *ID:* ${jid}
│ 👑 *Bot Admin:* ${isBotAdmin ? '✅ Sí' : '❌ No'}
│ 👥 *Participantes:* ${totalParticipants}
│ 📍 *Estado:* ${participantStatus}
${isBotAdmin ? `│ 🔗 *Enlace:* https://chat.whatsapp.com/${await conn.groupInviteCode(jid).catch(_ => '---')}\n` : ''}└──────────────\n\n`;
    }

    m.reply(`📊 *LISTA DE GRUPOS*\n\n*Total de grupos:* ${totalGroups}\n\n${txt}`.trim());

  } catch (error) {
    console.error('Error en listado de grupos:', error);

    // Reacción de error
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      });
    } catch (reactError) {}

    m.reply('❌ *ERROR AL OBTENER GRUPOS*\n\nNo se pudo obtener la lista de grupos. Intenta nuevamente.');
  }    
};

handler.help = ['groups', 'grouplist'];
handler.tags = ['info'];
handler.command = /^(groups|grouplist|listadegrupo|gruposlista|listagrupos|listgroup|listadogrupos)$/i;
handler.rowner = true;
handler.private = true;

export default handler;
