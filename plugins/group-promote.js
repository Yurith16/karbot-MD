const handler = async (m, {conn, usedPrefix, text}) => {
  let number;

  if (isNaN(text) && !text.match(/@/g)) {
    // No hacer nada, se manejará en el error
  } else if (isNaN(text)) {
    number = text.split`@`[1];
  } else if (!isNaN(text)) {
    number = text;
  }

  if (!text && !m.quoted) {
    return conn.reply(m.chat, 
      `❌ *DEBES ETIQUETAR A UN USUARIO*\n\n` +
      `💡 *Ejemplos de uso:*\n` +
      `• ${usedPrefix}daradmin @usuario\n` +
      `• ${usedPrefix}daradmin respuesta-a-mensaje\n` +
      `• ${usedPrefix}daradmin 50412345678`, 
    m);
  }

  if (number && (number.length > 13 || (number.length < 11 && number.length > 0))) {
    return conn.reply(m.chat, `❌ *NÚMERO INVÁLIDO*`, m);
  }

  try {
    let user;

    if (text) {
      user = number + '@s.whatsapp.net';
    } else if (m?.quoted?.sender) {
      user = m.quoted.sender;
    } else if (m.mentionedJid && m.mentionedJid[0]) {
      user = m.mentionedJid[0];
    } else {
      throw new Error('No se pudo identificar al usuario');
    }

    await conn.groupParticipantsUpdate(m.chat, [user], 'promote');

    conn.reply(m.chat, 
      `✅ *ADMINISTRADOR AGREGADO*\n\n` +
      `👤 *Usuario:* @${user.split('@')[0]}\n` +
      `⚡ *Acción realizada por:* @${m.sender.split('@')[0]}\n` +
      `✨ *Por KARBOT-MD*`, 
    m, { mentions: [user, m.sender] });

  } catch (error) {
    console.error(error);
    conn.reply(m.chat, 
      `❌ *ERROR AL AGREGAR ADMINISTRADOR*\n\n` +
      `💡 *Posibles causas:*\n` +
      `• El usuario ya es administrador\n` +
      `• No tengo permisos suficientes\n` +
      `• El usuario no está en el grupo\n` +
      `• Error de conexión`, 
    m);
  }
};

handler.help = ['promote @usuario'];
handler.tags = ['group'];
handler.command = /^(promote|daradmin|darpoder|agregaradmin|haceradmin)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
handler.fail = null;
export default handler;
