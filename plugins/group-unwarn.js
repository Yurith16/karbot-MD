/* Creador: HERNANDEZ */

const handler = async (m, { conn, text, command, usedPrefix }) => {
  const warntext = `*⚠️ ¡Etiqueta al usuario o responde a su mensaje para eliminarle una advertencia!*\n*Ejemplo: ${usedPrefix + command} @${global.suittag}*`;

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

  // Se añade una validación más robusta para evitar el error
  if (who === conn.user.jid) {
    return;
  }

  const user = global.db.data.users[who];
  if (!user) {
    throw '*❗ No se encontró la información de ese usuario en la base de datos.*';
  }

  if (user.warn == 0) {
    throw '*⚠️ ¡El usuario no tiene advertencias!*';
  }

  user.warn -= 1;
  await m.reply(`*✅ Advertencia eliminada!*\n\n*@${who.split`@`[0]} ahora tiene ${user.warn}/3 advertencias.*\n\n*Recuerda que si el usuario llega a 3 advertencias, será expulsado del grupo.*`, null, { mentions: [who] });
};

handler.tags = ['group'];
handler.help = ['unwarn'];
handler.command = /^(unwarn|delwarn|deladvertir|deladvertencia|delwarning)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;