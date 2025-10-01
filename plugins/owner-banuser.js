const handler = async (m, {conn, participants, usedPrefix, command}) => {
  const BANtext = `❌ *DEBES MENCIONAR UN USUARIO*\n\nUso: *${usedPrefix + command} @usuario*\nO responde a un mensaje con: *${usedPrefix + command}*`;

  if (!m.mentionedJid[0] && !m.quoted) {
    // Reacción de error
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      });
    } catch (reactError) {}

    return m.reply(BANtext, m.chat, {mentions: conn.parseMention(BANtext)});
  }

  let who;
  if (m.isGroup) {
    who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
  } else {
    who = m.chat;
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

    return m.reply('❌ *USUARIO NO VÁLIDO*\n\nNo se pudo identificar al usuario.', m.chat);
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

    return m.reply(`❌ *USUARIO NO ENCONTRADO*\n\n@${who.split('@')[0]} no está registrado en la base de datos.`, m.chat, {mentions: [who]});
  }

  // Verificar si ya está baneado
  if (users[who].banned) {
    // Reacción de información
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: 'ℹ️',
          key: m.key
        }
      });
    } catch (reactError) {}

    return m.reply(`ℹ️ *USUARIO YA ESTÁ BANEADO*\n\n@${who.split('@')[0]} ya estaba baneado anteriormente.`, m.chat, {mentions: [who]});
  }

  // Banear al usuario
  users[who].banned = true;

  // Reacción de éxito
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '🚫',
        key: m.key
      }
    });
  } catch (reactError) {}

  m.reply(`🚫 *USUARIO BANEADO*\n\n👤 *Usuario:* @${who.split('@')[0]}\n⚡ *Estado:* Baneado permanentemente\n\nEl usuario ya no podrá usar los comandos del bot.`, m.chat, {mentions: [who]});
};

handler.command = /^(banuser|banear|banusuario)$/i;
handler.rowner = true;
handler.help = ['banuser @usuario'];

export default handler;
