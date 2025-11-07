const handler = async function(m, { conn, text, usedPrefix, command }) {
  const user = global.db.data.users[m.sender];

  if (user.registered === true) {
    return await conn.sendMessage(m.chat, {
      text: `*「❌」 Ya Estás Registrado*\n\n> ✦ *Ya tienes una cuenta registrada*`
    }, { quoted: m });
  }

  if (!text) {
    return await conn.sendMessage(m.chat, {
      text: `*「📝」 Formato de Registro*\n\n> ✦ *Uso:* » ${usedPrefix + command} nombre.edad\n> ✦ *Ejemplo:* » ${usedPrefix + command} Carlos.18`
    }, { quoted: m });
  }

  // Validar formato nombre.edad
  const parts = text.split('.');
  if (parts.length !== 2) {
    return await conn.sendMessage(m.chat, {
      text: `*「❌」 Formato Incorrecto*\n\n> ✦ *Usa:* » nombre.edad\n> ✦ *Ejemplo:* » ${usedPrefix + command} Carlos.18`
    }, { quoted: m });
  }

  const name = parts[0].trim();
  const age = parseInt(parts[1]);

  if (!name || name.length > 30) {
    return await conn.sendMessage(m.chat, {
      text: `*「❌」 Nombre Inválido*\n\n> ✦ *El nombre debe tener menos de 30 caracteres*`
    }, { quoted: m });
  }

  if (isNaN(age) || age < 5 || age > 100) {
    return await conn.sendMessage(m.chat, {
      text: `*「❌」 Edad Inválida*\n\n> ✦ *La edad debe ser entre 5 y 100 años*`
    }, { quoted: m });
  }

  // Registrar usuario
  user.name = name;
  user.age = age;
  user.regTime = +new Date();
  user.registered = true;
  user.money = (user.money || 0) + 10000;
  user.exp = (user.exp || 0) + 10000;

  // Reacción de éxito
  await conn.sendMessage(m.chat, {
    react: { text: '✅', key: m.key }
  });

  // Mensaje de confirmación
  await conn.sendMessage(m.chat, {
    text: `*「✅」 Registro Exitoso*\n\n` +
          `> ✦ *Nombre:* » ${name}\n` +
          `> ✦ *Edad:* » ${age} años\n` +
          `> ✦ *Recompensa:* » $10,000 + 10,000 XP\n\n` +
          `*¡Bienvenido a Karbot!*`
  }, { quoted: m });
};

handler.help = ['verificar'];
handler.tags = ['xp'];
handler.command = /^(verify|register|verificar|reg|registrar)$/i;

export default handler;