import { createHash } from 'crypto';

const items = ['limit', 'exp'];
const confirmation = {};

async function handler(m, { conn, args, usedPrefix, command }) {
  if (confirmation[m.sender]) {
    await conn.sendMessage(m.chat, {
      text: '*⏳ TRANSFERENCIA PENDIENTE*\n\nYa tienes una transferencia en proceso. Responde primero a esa solicitud.',
      mentions: [m.sender]
    }, { quoted: m });
    return;
  }

  const user = global.db.data.users[m.sender];
  const item = items.filter((v) => v in user && typeof user[v] == 'number');

  const helpMessage = `
*💰 SISTEMA DE TRANSFERENCIA - KARBOT-MD*

*Uso correcto:*
➺ *${usedPrefix + command} [tipo] [cantidad] @usuario*

*Ejemplos:*
➺ *${usedPrefix + command} exp 100 @usuario*
➺ *${usedPrefix + command} limit 5 @usuario*

*Tipos disponibles:*
• *exp* - Experiencia
• *limit* - Límite

*Nota:* Debes mencionar al usuario que recibirá la transferencia.
`.trim();

  const type = (args[0] || '').toLowerCase();
  if (!item.includes(type)) {
    await conn.sendMessage(m.chat, {
      text: helpMessage,
      mentions: [m.sender]
    }, { quoted: m });
    return;
  }

  const count = Math.min(Number.MAX_SAFE_INTEGER, Math.max(1, (isNumber(args[1]) ? parseInt(args[1]) : 1))) * 1;

  let who;
  if (m.mentionedJid && m.mentionedJid[0]) {
    who = m.mentionedJid[0];
  } else if (args[2]) {
    who = args[2].replace(/[@ .+-]/g, '') + '@s.whatsapp.net';
  }

  if (!who) {
    await conn.sendMessage(m.chat, {
      text: '*❌ DEBES MENCIONAR AL USUARIO*\n\nEjemplo: */transfer exp 100 @usuario*',
      mentions: [m.sender]
    }, { quoted: m });
    return;
  }

  if (!(who in global.db.data.users)) {
    await conn.sendMessage(m.chat, {
      text: '*❌ USUARIO NO ENCONTRADO*\n\nEl usuario mencionado no está registrado en la base de datos.',
      mentions: [m.sender]
    }, { quoted: m });
    return;
  }

  if (user[type] * 1 < count) {
    const itemName = type === 'exp' ? 'experiencia' : 'límites';
    await conn.sendMessage(m.chat, {
      text: `*❌ FONDOS INSUFICIENTES*\n\nNo tienes suficiente ${itemName}.\nDisponible: *${user[type]} ${type}*`,
      mentions: [m.sender]
    }, { quoted: m });
    return;
  }

  const userName = who.split('@')[0];
  const itemName = type === 'exp' ? 'experiencia' : 'límites';

  const confirmMessage = `*⚠️ CONFIRMAR TRANSFERENCIA*

¿Estás seguro de transferir *${count} ${itemName}* a @${userName}?

*Esta acción no se puede deshacer.*

*Para confirmar:* Responde *si*
*Para cancelar:* Responde *no*

⏳ *Tienes 60 segundos para responder*`.trim();

  // Sistema de reacción
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '💸',
        key: m.key
      }
    });
  } catch (reactError) {
    // Ignorar error de reacción
  }

  await conn.sendMessage(m.chat, {
    text: confirmMessage,
    mentions: [who]
  }, { quoted: m });

  confirmation[m.sender] = {
    sender: m.sender,
    to: who,
    message: m,
    type,
    count,
    timeout: setTimeout(() => {
      conn.sendMessage(m.chat, {
        text: '*❌ TIEMPO AGOTADO*\n\nNo se obtuvo respuesta. La transferencia ha sido cancelada.',
        mentions: [m.sender]
      }, { quoted: m });
      delete confirmation[m.sender];
    }, 60 * 1000)
  };
}

handler.before = async (m) => {
  if (m.isBaileys) return;
  if (!(m.sender in confirmation)) return;
  if (!m.text) return;

  const { timeout, sender, to, type, count } = confirmation[m.sender];
  if (m.id === confirmation[m.sender].message.id) return;

  const user = global.db.data.users[sender];
  const _user = global.db.data.users[to];

  if (/^No|no$/i.test(m.text)) {
    clearTimeout(timeout);
    delete confirmation[sender];

    // Reacción de cancelación
    try {
      await this.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      });
    } catch (reactError) {
      // Ignorar error de reacción
    }

    await conn.sendMessage(m.chat, {
      text: '*🚫 TRANSFERENCIA CANCELADA*\n\nLa transferencia ha sido cancelada por el usuario.',
      mentions: [m.sender]
    }, { quoted: m });
    return;
  }

  if (/^Si|si$/i.test(m.text)) {
    const previous = user[type] * 1;
    const _previous = _user[type] * 1;
    user[type] -= count * 1;
    _user[type] += count * 1;

    if (previous > user[type] * 1 && _previous < _user[type] * 1) {
      // Reacción de éxito
      try {
        await this.sendMessage(m.chat, {
          react: {
            text: '✅',
            key: m.key
          }
        });
      } catch (reactError) {
        // Ignorar error de reacción
      }

      const itemName = type === 'exp' ? 'experiencia' : 'límites';
      await conn.sendMessage(m.chat, {
        text: `*✅ TRANSFERENCIA EXITOSA*\n\nHas transferido *${count} ${itemName}* a @${to.split('@')[0]}\n\n*🤖 KARBOT-MD | © 2024*`,
        mentions: [to]
      }, { quoted: m });
    } else {
      user[type] = previous;
      _user[type] = _previous;
      await conn.sendMessage(m.chat, {
        text: `*❌ ERROR EN LA TRANSFERENCIA*\n\nNo se pudo completar la transferencia de *${count} ${type}* a @${to.split('@')[0]}`,
        mentions: [to]
      }, { quoted: m });
    }
    clearTimeout(timeout);
    delete confirmation[sender];
  }
};

handler.help = ['transfer'].map((v) => v + ' [tipo] [cantidad] [@tag]');
handler.tags = ['xp'];
handler.command = ['payxp', 'transfer', 'darxp', 'transferir'];
handler.disabled = false;

export default handler;

function isNumber(x) {
  return !isNaN(x);
}