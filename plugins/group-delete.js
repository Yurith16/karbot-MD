const handler = async (m, { conn, usedPrefix, command }) => {
  if (!m.quoted) throw `> 🜸 *RESPONDE A UN MENSAJE* » Para eliminarlo`;

  try {
    const delet = m.message.extendedTextMessage.contextInfo.participant;
    const bang = m.message.extendedTextMessage.contextInfo.stanzaId;

    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: bang,
        participant: delet,
      },
    });

    // Mensaje de éxito con el emoji correcto
    m.reply(`> 🜸 *ELIMINADO* » 🫡`);
  } catch (error) {
    try {
      await conn.sendMessage(m.chat, { delete: m.quoted.vM.key });
      m.reply(`> 🜸 *ELIMINADO* » 🫡`);
    } catch {
      throw `> 🜸 *ERROR* » No se pudo eliminar el mensaje\n> 🜸 *SOLUCIÓN* » Verifica que soy admin y tengo permisos`;
    }
  }
};

handler.help = ["del", "delete", "eliminar"];
handler.tags = ["group"];
handler.command = /^del(ete)?|eliminar$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
export default handler;
