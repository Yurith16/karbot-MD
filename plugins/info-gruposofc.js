const handler = async (m, { conn }) => {
  await conn.sendMessage(m.chat, {
    text: `*「🛡️」 Grupo Oficial Karbot*\n\n> ✦ *Enlace:* » https://chat.whatsapp.com/JeKUpOxymP4F6faK3B2Jqb\n> ✦ *Descripción:* » Únete a la comunidad oficial\n> ✦ *Nota:* » Este es el único grupo oficial`
  }, { quoted: m });
};

handler.command = ['linkgc', 'grupos', 'grupooficial', 'soporte'];
export default handler;