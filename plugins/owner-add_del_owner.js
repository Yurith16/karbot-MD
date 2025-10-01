const handler = async (m, { conn, text, usedPrefix, command }) => {
  const why = `❌ *DEBES MENCIONAR UN USUARIO*\n\nEjemplos:\n• *${usedPrefix + command}* @usuario\n• *${usedPrefix + command}* 123456789\n• *${usedPrefix + command}* <responder a mensaje>`;

  let who;
  if (m.mentionedJid && m.mentionedJid.length > 0) {
    who = m.mentionedJid[0];
  } else if (m.quoted) {
    who = m.quoted.sender;
  } else if (text) {
    who = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
  } else {
    return conn.reply(m.chat, why, m, {mentions: [m.sender]});
  }

  if (!who) return conn.reply(m.chat, why, m, {mentions: [m.sender]});

  // Reacción de proceso
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '👑',
        key: m.key
      }
    });
  } catch (reactError) {}

  switch (command) {
    case 'addowner':
      const nuevoNumero = who;
      global.owner.push([nuevoNumero]);
      await conn.reply(m.chat, `✅ *NUEVO PROPIETARIO AGREGADO*\n\n👤 @${who.split('@')[0]} ahora es propietario del bot.\n\n⚡ ¡Tiene acceso completo al sistema!`, m, {mentions: [who]});
      break;

    case 'borrarowner':
      const numeroAEliminar = who;
      const index = global.owner.findIndex(owner => owner[0] === numeroAEliminar);
      if (index !== -1) {
        global.owner.splice(index, 1);
        await conn.reply(m.chat, `✅ *PROPIETARIO ELIMINADO*\n\n👤 @${who.split('@')[0]} ya no es propietario del bot.\n\n🚫 Se revocaron sus permisos.`, m, {mentions: [who]});
      } else {
        await conn.reply(m.chat, `❌ *USUARIO NO ES PROPIETARIO*\n\n👤 @${who.split('@')[0]} no está en la lista de propietarios.`, m, {mentions: [who]});
      }
      break;
  }
};
handler.command = /^(addowner|borrarowner)$/i;
handler.rowner = true;
export default handler;