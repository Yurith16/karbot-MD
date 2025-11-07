const handler = async function(m, { conn, usedPrefix, command }) {
  const user = global.db.data.users[m.sender];

  if (!user.registered) {
    return await conn.sendMessage(m.chat, {
      text: `*「❌」 No Estás Registrado*\n\n> ✦ *No tienes una cuenta para eliminar*`
    }, { quoted: m });
  }

  // Eliminar registro
  user.registered = false;
  user.name = '';
  user.age = '';
  user.regTime = 0;

  // Reacción de éxito
  await conn.sendMessage(m.chat, {
    react: { text: '🗑️', key: m.key }
  });

  // Mensaje de confirmación
  await conn.sendMessage(m.chat, {
    text: `*「🗑️」 Registro Eliminado*\n\n` +
          `> ✦ *Tu cuenta ha sido eliminada*\n` +
          `> ✦ *Para registrarte de nuevo usa:*\n` +
          `> ✦ *Comando:* » ${usedPrefix}reg nombre.edad`
  }, { quoted: m });
};

handler.help = ['unreg'];
handler.tags = ['xp'];
handler.command = /^unreg(ister)?$/i;

export default handler;