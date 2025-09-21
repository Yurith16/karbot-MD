const handler = async (m, {conn, usedPrefix, command}) => {
  if (!m.quoted) throw `❌ *DEBES RESPONDER A UN MENSAJE PARA ELIMINARLO*`;

  try {
    const delet = m.message.extendedTextMessage.contextInfo.participant;
    const bang = m.message.extendedTextMessage.contextInfo.stanzaId;

    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat, 
        fromMe: false, 
        id: bang, 
        participant: delet
      }
    });

    m.reply(`✅ *MENSAJE ELIMINADO CORRECTAMENTE*`);

  } catch (error) {
    try {
      await conn.sendMessage(m.chat, {delete: m.quoted.vM.key});
      m.reply(`✅ *MENSAJE ELIMINADO CORRECTAMENTE*`);
    } catch {
      throw `❌ *NO SE PUDO ELIMINAR EL MENSAJE*\n\n*Asegúrate de que soy administrador y tengo permisos para eliminar mensajes*`;
    }
  }
};

handler.help = ['del', 'delete', 'eliminar'];
handler.tags = ['group'];
handler.command = /^del(ete)?|eliminar$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
export default handler;