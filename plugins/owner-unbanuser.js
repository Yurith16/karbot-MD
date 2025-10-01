const handler = async (m, {conn, text}) => {
  let who;

  // Obtener el usuario de diferentes formas
  if (m.mentionedJid && m.mentionedJid.length > 0) {
    // Si hay menciones directas
    who = m.mentionedJid[0];
  } else if (m.quoted) {
    // Si se respondió a un mensaje
    who = m.quoted.sender;
  } else if (text) {
    // Si se proporcionó texto con número
    who = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
  } else {
    // Reacción de error
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      });
    } catch (reactError) {}

    throw `❌ *DEBES MENCIONAR UN USUARIO*\n\nPuedes:\n• Etiquetar al usuario: !unban @usuario\n• Responder a su mensaje: !unban\n• Usar su número: !unban 123456789`;
  }

  if (!who) {
    // Reacción de error
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      });
    } catch (reactError) {}

    throw '❌ *USUARIO NO VÁLIDO*\n\nNo se pudo identificar al usuario.';
  }

  const users = global.db.data.users;

  // Verificar si el usuario existe en la base de datos
  if (!users[who]) {
    // Reacción de error
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      });
    } catch (reactError) {}

    return conn.reply(m.chat, 
      `❌ *USUARIO NO ENCONTRADO*\n\n@${who.split('@')[0]} no está registrado en la base de datos.\n\nEl usuario necesita usar el bot al menos una vez para aparecer en el sistema.`, 
      m, { mentions: [who] }
    );
  }

  // Verificar si el usuario está baneado
  if (!users[who].banned) {
    // Reacción de información
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: 'ℹ️',
          key: m.key
        }
      });
    } catch (reactError) {}

    return conn.reply(m.chat,
      `ℹ️ *USUARIO NO ESTÁ BANEADO*\n\n@${who.split('@')[0]} ya puede usar todos los comandos del bot.`,
      m, { mentions: [who] }
    );
  }

  // Desbanear al usuario
  users[who].banned = false;

  // Reacción de éxito
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '✅',
        key: m.key
      }
    });
  } catch (reactError) {}

  const message = `
┌──「 ✅ USUARIO DESBANEADO 」
│
│ 👤 *Usuario:* @${who.split('@')[0]}
│ 🎯 *Estado:* Desbaneado exitosamente
│ 
│ 🔓 Ahora puede usar todos los comandos
│ del bot nuevamente
└──────────────`.trim();

  conn.reply(m.chat, message, m, {
    mentions: [who]
  });
};

handler.help = ['unbanuser'];
handler.tags = ['owner'];
handler.command = /^unbanuser|desbanear|desbanearuser|unban$/i;
handler.rowner = true;

export default handler;