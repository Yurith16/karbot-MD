const linkRegex = /https:/i;

export async function before(m, {conn, isAdmin, isBotAdmin}) {
  if (m.isBaileys && m.fromMe) {
    return true;
  }
  if (!m.isGroup) return false;
  
  const chat = global.db.data.chats[m.chat];
  const bot = global.db.data.settings[conn.user.jid] || {};
  const user = `@${m.sender.split`@`[0]}`;
  const isGroupLink = linkRegex.exec(m.text);
  
  if (chat.antiLink2 && isGroupLink && !isAdmin) {
    if (isBotAdmin) {
      // Permitir enlaces específicos
      const linkThisGroup = `https://chat.whatsapp.com/${await conn.groupInviteCode(m.chat)}`;
      const youtubeLinks = [`https://www.youtube.com/`, `https://youtu.be/`];
      
      if (m.text.includes(linkThisGroup)) return true;
      if (youtubeLinks.some(link => m.text.includes(link))) return true;
    }
    
    // Mensaje de advertencia
    await conn.sendMessage(m.chat, {
      text: `🚫 *ENLACE DETECTADO*\n\n▸ ${user}, los enlaces externos están prohibidos en este grupo.\n▸ Acción: Expulsión automática`,
      mentions: [m.sender]
    }, { quoted: m });
    
    if (!isBotAdmin) {
      return conn.sendMessage(m.chat, {
        text: `❌ *NO TIENGO PERMISOS*\n\nNo puedo expulsar usuarios. Por favor, dame permisos de administrador.`
      }, { quoted: m });
    }
    
    // Expulsar usuario si el bot tiene permisos
    if (isBotAdmin && bot.restrict) {
      try {
        // Eliminar mensaje primero
        await conn.sendMessage(m.chat, {
          delete: {
            remoteJid: m.chat,
            fromMe: false,
            id: m.key.id,
            participant: m.key.participant
          }
        });
        
        // Expulsar usuario
        const response = await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
        if (response[0].status === '404') {
          console.log('Usuario no encontrado para expulsar');
        }
        
      } catch (error) {
        console.error('Error en anti-link2:', error);
        await conn.sendMessage(m.chat, {
          text: `❌ *ERROR*\n\nNo pude eliminar el enlace. Verifica mis permisos.`
        }, { quoted: m });
      }
    } else if (!bot.restrict) {
      await conn.sendMessage(m.chat, {
        text: `⚙️ *RESTRICCIONES DESACTIVADAS*\n\nLa función de expulsión automática está desactivada en la configuración del bot.`
      }, { quoted: m });
    }
  }
  
  return true;
}