export async function before(m, {conn, isAdmin, isBotAdmin, isOwner, isROwner}) {
  // Ignorar mensajes propios del bot
  if (m.isBaileys && m.fromMe) return true;
  
  // Ignorar mensajes de grupo
  if (m.isGroup) return false;
  
  // Ignorar si no hay mensaje
  if (!m.message) return true;
  
  // Permitir comandos específicos incluso en privado
  const allowedCommands = ['PIEDRA', 'PAPEL', 'TIJERA', 'serbot', 'jadibot', 'menu', 'help', 'info'];
  const messageText = m.text || '';
  
  if (allowedCommands.some(cmd => messageText.includes(cmd))) return true;
  
  // Verificar configuración anti-privado
  const bot = global.db.data.settings[conn.user.jid] || {};
  
  if (bot.antiPrivate && !isOwner && !isROwner) {
    // Mensaje de bloqueo personalizado
    const blockMessage = `🚫 *BLOQUEO AUTOMÁTICO* 🤖
    
▸ *Usuario:* @${m.sender.split('@')[0]}
▸ *Motivo:* Mensajes privados no permitidos
▸ *Política:* Este bot no acepta mensajes privados

📋 *Para usar el bot:*
▸ Agrégalo a un grupo
▸ Usa los comandos en el contexto grupal
▸ Contacta al propietario para consultas

⚡ *KARBOT-MD - Sistema de seguridad*`;
    
    // Enviar mensaje de advertencia
    await conn.sendMessage(m.chat, {
      text: blockMessage,
      mentions: [m.sender]
    }, { quoted: m });
    
    // Bloquear usuario
    await conn.updateBlockStatus(m.chat, 'block');
    
    // Log del bloqueo
    console.log(`🔒 Usuario bloqueado: ${m.sender.split('@')[0]} - Anti-privado activado`);
  }
  
  return false;
}