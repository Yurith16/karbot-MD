export async function before(m, { conn, isAdmin, isBotAdmin, usedPrefix }) {
  if (m.isBaileys && m.fromMe) {
    return true;
  }
  if (!m.isGroup) return false;
  
  const chat = global.db.data.chats[m.chat];
  const bot = global.db.data.settings[conn.user.jid] || {};
  
  // Detectar mensajes demasiado largos (más de 5000 caracteres)
  if (chat.antiTraba && m.text && m.text.length > 5000) {
    const userMention = `@${m.sender.split('@')[0]}`;
    
    if (isAdmin) {
      // Solo advertencia para admins
      await conn.sendMessage(m.chat, {
        text: `⚠️ *ADMIN DETECTADO*\n\n${userMention}, tu mensaje es demasiado largo. Por favor, acorta el texto.`,
        mentions: [m.sender]
      }, { quoted: m });
      return true;
    }
    
    // Para usuarios normales - acción inmediata
    if (isBotAdmin && bot.restrict) {
      // Eliminar mensaje largo
      await conn.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: m.key.id,
          participant: m.key.participant
        }
      });
      
      // Mensaje de advertencia
      await conn.sendMessage(m.chat, {
        text: `🚫 *MENSAJE DEMASIADO LARGO*\n\n${userMention}, los mensajes extensos están prohibidos.\n▸ Límite: 5000 caracteres\n▸ Acción: Expulsión automática`,
        mentions: [m.sender]
      }, { quoted: m });
      
      // Expulsar después de 1 segundo
      setTimeout(async () => {
        try {
          await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
        } catch (error) {
          console.error('Error expulsando usuario:', error);
        }
      }, 1000);
      
    } else if (!isBotAdmin) {
      // Bot no es admin
      await conn.sendMessage(m.chat, {
        text: `❌ *SIN PERMISOS*\n\nNo tengo permisos de administrador para actuar contra mensajes largos.`
      }, { quoted: m });
    } else if (!bot.restrict) {
      // Restricciones desactivadas
      await conn.sendMessage(m.chat, {
        text: `⚙️ *RESTRICCIONES DESACTIVADAS*\n\nLa función anti-traba está desactivada en la configuración.`
      }, { quoted: m });
    }
  }
  
  return true;
}