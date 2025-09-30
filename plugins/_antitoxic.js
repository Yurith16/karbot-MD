const toxicRegex = /\b(puto|puta|rata|estupido|imbecil|rctmre|mrd|verga|vrga|maricon|pendejo|idiota|culero)\b/i;

export async function before(m, {conn, isAdmin, isBotAdmin, isOwner}) {
  const chat = global.db.data.chats[m.chat];
  
  // Si antiToxic está desactivado, salir
  if (!chat.antiToxic) {
    return false;
  }

  // Ignorar mensajes propios del bot
  if (m.isBaileys && m.fromMe) {
    return true;
  }
  
  // Ignorar mensajes que no son de grupo
  if (!m.isGroup) {
    return false;
  }
  
  const user = global.db.data.users[m.sender];
  const bot = global.db.data.settings[conn.user.jid] || {};
  const isToxic = toxicRegex.exec(m.text);

  // Detectar lenguaje tóxico
  if (isToxic && chat.antiToxic && !isOwner && !isAdmin) {
    user.warn += 1;
    
    if (!(user.warn >= 5)) {
      const warnMessage = `⚠️ *ADVERTENCIA POR LENGUAJE TÓXICO*
      
▸ *Usuario:* @${m.sender.split`@`[0]}
▸ *Palabra detectada:* "${isToxic[0]}"
▸ *Advertencia:* ${user.warn}/5
▸ *Consecuencia:* Expulsión en 5 advertencias

📋 *Normas del grupo:*
▸ Respeta a todos los miembros
▸ Evita lenguaje ofensivo
▸ Mantén un ambiente positivo

⚡ *KARBOT-MD - Moderación automática*`;
      
      await conn.sendMessage(m.chat, {
        text: warnMessage,
        mentions: [m.sender]
      }, { quoted: m });
    }
  }

  // Expulsar después de 5 advertencias
  if (user.warn >= 5) {
    user.warn = 0;
    
    const banMessage = `🚫 *USUARIO EXPULSADO*
    
▸ *Usuario:* @${m.sender.split('@')[0]}
▸ *Motivo:* 5 advertencias por lenguaje tóxico
▸ *Acción:* Expulsión permanente

⚡ *KARBOT-MD - Moderación automática*`;
    
    await conn.sendMessage(m.chat, {
      text: banMessage,
      mentions: [m.sender]
    }, { quoted: m });
    
    user.banned = true;
    
    // Expulsar del grupo si el bot es admin
    if (isBotAdmin) {
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
    }
  }
  
  return false;
}