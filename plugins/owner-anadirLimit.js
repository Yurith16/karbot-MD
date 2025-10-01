const handler = async (m, {conn, text}) => {
  let who;

  // Obtener usuario de diferentes formas
  if (m.mentionedJid && m.mentionedJid.length > 0) {
    who = m.mentionedJid[0];
  } else if (m.quoted) {
    who = m.quoted.sender;
  } else if (text) {
    const numberMatch = text.match(/\d+/g);
    if (numberMatch && numberMatch.length > 1) {
      // El primer número es el usuario, el segundo la cantidad
      who = numberMatch[0] + '@s.whatsapp.net';
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

    throw '❌ *DEBES MENCIONAR UN USUARIO*\n\nPuedes:\n• Etiquetar al usuario: !añadirdiamantes @usuario 50\n• Responder a su mensaje: !añadirdiamantes 50\n• Usar número: !añadirdiamantes 123456789 50';
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

    throw '❌ *DEBES ESPECIFICAR LA CANTIDAD DE DIAMANTES*\n\nEjemplo: !añadirdiamantes @usuario 100';
  }

  // Extraer la cantidad de diamantes del texto (eliminar menciones y números de usuario)
  const txt = text.replace(/@\d+/g, '').replace(/\d+@s\.whatsapp\.net/g, '').trim();
  const cantidadMatch = txt.match(/\d+/);

  if (!cantidadMatch) {
    // Reacción de error
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      });
    } catch (reactError) {}

    throw '❌ *CANTIDAD NO VÁLIDA*\n\nDebes especificar cuántos diamantes agregar.\nEjemplo: !añadirdiamantes @usuario 50';
  }

  const diamantes = parseInt(cantidadMatch[0]);
  if (diamantes < 1) {
    // Reacción de error
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      });
    } catch (reactError) {}

    throw '❌ *CANTIDAD MÍNIMA NO VÁLIDA*\n\nDebes agregar al menos 1 diamante.';
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

  // Agregar diamantes al usuario
  const diamantesAntes = users[who].limit;
  users[who].limit += diamantes;
  const diamantesDespues = users[who].limit;

  // Reacción de éxito
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '💎',
        key: m.key
      }
    });
  } catch (reactError) {}

  const message = `
┌──「 💎 DIAMANTES AGREGADOS 」
│
│ 👤 *Usuario:* @${who.split('@')[0]}
│ 
│ 💰 *Diamantes:*
│ ➺ Antes: ${diamantesAntes} 💎
│ ➺ Agregado: +${diamantes} 💎
│ ➺ Después: ${diamantesDespues} 💎
│ 
│ ✨ ¡Tesoro incrementado!
└──────────────`.trim();

  conn.reply(m.chat, message, m, {
    mentions: [who]
  });
};

handler.command = /^(añadirdiamantes|addd|dard|dardiamantes|agregardiamantes|dardiamentes|dardiamente)$/i;
handler.rowner = true;
handler.help = ['añadirdiamantes @usuario cantidad'];

export default handler;