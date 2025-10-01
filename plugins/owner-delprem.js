const handler = async (m, {conn, text, usedPrefix, command}) => {
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

    throw '❌ *DEBES MENCIONAR AL USUARIO*\n\nResponde a un mensaje o menciona al usuario que quieres quitar del premium.';
  }

  const user = global.db.data.users[who];

  if (!user) {
    // Reacción de error
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      });
    } catch (reactError) {}

    throw '❌ *USUARIO NO ENCONTRADO*\n\nEl usuario mencionado no está registrado en la base de datos.';
  }

  if (user.premiumTime === 0 || !user.premium) {
    // Reacción de error
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      });
    } catch (reactError) {}

    throw '❌ *USUARIO NO ES PREMIUM*\n\nEste usuario no tiene suscripción premium activa.';
  }

  // Quitar premium
  user.premiumTime = 0;
  user.premium = false;

  // Reacción de éxito
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '✅',
        key: m.key
      }
    });
  } catch (reactError) {}

  const textdelprem = `✅ *SUSCRIPCIÓN PREMIUM ELIMINADA*\n\n👤 *Usuario:* @${who.split`@`[0]}\n⭐ *Estado:* Premium removido\n\nLa suscripción premium ha sido cancelada exitosamente.`;

  m.reply(textdelprem, null, {mentions: conn.parseMention(textdelprem)});
};

handler.help = ['delprem <@user>'];
handler.tags = ['owner'];
handler.command = /^(remove|-|del)prem|quitarprem|removerprem|eliminarprem$/i;
handler.group = true;
handler.rowner = true;

export default handler;