/* Creador: HERNANDEZ */

const handler = async (m, { conn, text, command, usedPrefix }) => {
  const warntext = `*⚠️ ¡Etiqueta al usuario o responde a su mensaje para advertirle!*\n*Ejemplo: ${usedPrefix + command} @${global.suittag} Escribir el motivo aquí*`;

  if (!m.isGroup) throw '*❗ Este comando solo se puede usar en grupos.*';

  let who;
  if (m.mentionedJid && m.mentionedJid[0]) {
    who = m.mentionedJid[0];
  } else if (m.quoted && m.quoted.sender) {
    who = m.quoted.sender;
  } else if (text) {
    who = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
  } else {
    throw warntext;
  }

  // Se corrige el problema de "testi.includes"
  if (who === conn.user.jid) {
    return;
  }

  const user = global.db.data.users[who];
  if (!user) {
    throw '*❗ No se encontró la información de ese usuario en la base de datos.*';
  }

  const dReason = 'Sin motivo';
  const msgtext = text || dReason;
  const sdms = msgtext.replace(/@\d+-?\d*/g, '').trim();

  user.warn += 1;
  await m.reply(`*⚠️ ¡Advertencia para @${who.split`@`[0]}!*\n*Motivo:* ${sdms}\n\n*Ahora tiene ${user.warn}/3 advertencias.*`, null, { mentions: [who] });

  if (user.warn >= 3) {
    const bot = global.db.data.settings[conn.user.jid] || {};
    if (!bot.restrict) {
      return m.reply(`*❌ El usuario @${who.split`@`[0]} ha llegado a 3 advertencias, pero la expulsión automática está desactivada. Para activarla, usa el comando #enable restrict*`, null, { mentions: [who] });
    }
    user.warn = 0;
    await m.reply(`*❗ @${who.split`@`[0]} ha sido expulsado del grupo por llegar a 3 advertencias.*\n\n*KARBOT-MD se disculpa por esta acción. No se admiten usuarios que incumplan las reglas.*`, null, { mentions: [who] });
    await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
  }
  return !1;
};

handler.tags = ['group'];
handler.help = ['warn'];
handler.command = /^(advertir|advertencia|warn|warning)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;