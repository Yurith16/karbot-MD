export async function before(m, {conn, isAdmin, isBotAdmin, isOwner, isROwner}) {
  if (m.isBaileys && m.fromMe) return true;
  if (m.isGroup) return false;
  if (!m.message) return true;

  // Permitir comandos específicos incluso en privado
  const allowedCommands = ['PIEDRA', 'PAPEL', 'TIJERA', 'serbot', 'jadibot', 'menu', 'help', 'info'];
  const messageText = m.text || '';

  if (allowedCommands.some(cmd => messageText.includes(cmd))) return true;

  // Verificar configuración anti-privado
  const bot = global.db.data.settings[conn.user.jid] || {};

  if (bot.antiPrivate && !isOwner && !isROwner) {
    // Mensaje de bloqueo reducido
    const blockMessage = `🚫 *Karbot - AntiPrivado*\n\n` +
                        `@${m.sender.split('@')[0]} Mensajes privados no permitidos\n` +
                        `▸ Usa el bot en grupos\n` +
                        `▸ Contacta al propietario`;

    // Enviar mensaje y bloquear
    await Promise.all([
      conn.sendMessage(m.chat, {
        text: blockMessage,
        mentions: [m.sender]
      }, { quoted: m }),
      conn.updateBlockStatus(m.chat, 'block')
    ]);
  }

  return false;
}