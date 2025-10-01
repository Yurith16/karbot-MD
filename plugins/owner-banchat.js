const handler = async (m, { conn }) => {
  // Reacción de proceso
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '🚫',
        key: m.key
      }
    });
  } catch (reactError) {}

  const thisBot = conn.user.jid;

  // Verificar si se mencionó a un bot específico
  if (m.mentionedJid && m.mentionedJid.length > 0) {
    const mentionedBot = m.mentionedJid[0];

    // Solo permitir banear al bot actual
    if (mentionedBot !== thisBot) {
      // Reacción de error
      try {
        await conn.sendMessage(m.chat, {
          react: {
            text: '❌',
            key: m.key
          }
        });
      } catch (reactError) {}

      return m.reply('❌ *SOLO PUEDES BANEAR AL BOT ACTUAL*\n\nSolo puedes banear a este bot del chat.');
    }

    if (global.db.data.chats[m.chat].isBanned) {
      // Reacción de información
      try {
        await conn.sendMessage(m.chat, {
          react: {
            text: 'ℹ️',
            key: m.key
          }
        });
      } catch (reactError) {}

      return m.reply('ℹ️ *CHAT YA BANEADO*\n\nEste chat ya estaba baneado anteriormente.');
    }

    global.db.data.chats[m.chat].isBanned = true;

    // Reacción de éxito
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '✅',
          key: m.key
        }
      });
    } catch (reactError) {}

    return m.reply(`✅ *CHAT BANEADO*\n\nEl bot *${conn.user.name || 'actual'}* ha sido baneado de este chat.\n\n🚫 Ya no responderá a comandos aquí.`);
  }

  // Banear chat normal (sin mención específica)
  if (global.db.data.chats[m.chat].isBanned) {
    // Reacción de información
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: 'ℹ️',
          key: m.key
        }
      });
    } catch (reactError) {}

    return m.reply('ℹ️ *CHAT YA BANEADO*\n\nEste chat ya estaba baneado anteriormente.');
  }

  global.db.data.chats[m.chat].isBanned = true;

  // Reacción de éxito
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '✅',
        key: m.key
      }
    });
  } catch (reactError) {}

  m.reply('✅ *CHAT BANEADO*\n\nEste chat ha sido baneado exitosamente.\n\n🚫 El bot ya no responderá a comandos aquí.');
};

handler.help = ['banchat', 'banchat @bot'];
handler.tags = ['owner'];
handler.command = /^banchat|banearchat|bloquearchat$/i;
handler.rowner = true;

export default handler;