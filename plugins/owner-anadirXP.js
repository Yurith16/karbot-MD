const handler = async (m, {conn, text}) => {
  let who;

  // Obtener usuario de diferentes formas
  if (m.mentionedJid && m.mentionedJid.length > 0) {
    who = m.mentionedJid[0];
  } else if (m.quoted) {
    who = m.quoted.sender;
  } else if (text) {
    const numberMatch = text.match(/\d+/g);
    if (numberMatch) {
      who = numberMatch.join('') + '@s.whatsapp.net';
    }
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

    throw '❌ *DEBES MENCIONAR UN USUARIO*\n\nPuedes:\n• Etiquetar al usuario: !añadirxp @usuario 100\n• Responder a su mensaje: !añadirxp 100\n• Usar su número: !añadirxp 123456789 100';
  }

  if (!text) {
    // Reacción de error
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      });
    } catch (reactError) {}

    throw '❌ *DEBES ESPECIFICAR LA CANTIDAD DE XP*\n\nEjemplo: !añadirxp @usuario 500';
  }

  // Extraer la cantidad de XP del texto (eliminar menciones)
  const txt = text.replace(/@\d+/g, '').trim();
  if (!txt) throw '❌ *CANTIDAD NO VÁLIDA*\n\nDebes especificar cuánta XP agregar.';

  if (isNaN(txt)) {
    // Reacción de error
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      });
    } catch (reactError) {}

    throw '❌ *LA CANTIDAD DEBE SER UN NÚMERO*\n\nEjemplo: !añadirxp @usuario 500';
  }

  const xp = parseInt(txt);
  if (xp < 1) {
    // Reacción de error
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      });
    } catch (reactError) {}

    throw '❌ *CANTIDAD MÍNIMA NO VÁLIDA*\n\nDebes agregar al menos 1 punto de experiencia.';
  }

  // Verificar si el usuario existe en la base de datos
  const users = global.db.data.users;
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
      `❌ *USUARIO NO ENCONTRADO*\n\n@${who.split('@')[0]} no está registrado en la base de datos.\n\nEl usuario necesita usar el bot al menos una vez.`, 
      m, { mentions: [who] }
    );
  }

  // Agregar XP al usuario
  const expAntes = users[who].exp;
  users[who].exp += xp;
  const expDespues = users[who].exp;

  // Reacción de éxito
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '⭐',
        key: m.key
      }
    });
  } catch (reactError) {}

  const message = `
┌──「 ✅ EXPERIENCIA AGREGADA 」
│
│ 👤 *Usuario:* @${who.split('@')[0]}
│ 
│ 📊 *Experiencia:*
│ ➺ Antes: ${expAntes} XP
│ ➺ Agregado: +${xp} XP
│ ➺ Después: ${expDespues} XP
│ 
│ ⚡ ¡Nuevo poder adquirido!
└──────────────`.trim();

  conn.reply(m.chat, message, m, {
    mentions: [who]
  });
};

handler.command = /^(añadirxp|addexp|agregarexp|agregarxp|darexp|darxp)$/i;
handler.rowner = true;
handler.help = ['añadirxp @usuario cantidad'];

export default handler;