const handler = async (m, { conn }) => {
  await conn.sendMessage(m.chat, {
    text: `*「👑」 Propietario de Karbot*\n\n> ✦ *Nombre:* » Hernandez\n> ✦ *Contacto:* » +504 9692-6150\n> ✦`
  }, { quoted: m });
};

handler.help = ['owner', 'creador', 'desarrollador'];
handler.tags = ['info'];
handler.command = /^(owner|creator|creador|propietario|desarrollador|hernandez)$/i;

export default handler;