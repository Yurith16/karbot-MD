import Presence from "baileys";

const handler = async (m, {conn, args, text}) => {
  if (!text) throw '*⚠️ ¡Falta el nombre!*';
  try {
    const newName = args.join` `;
    if (!newName) {
      throw '*⚠️ ¡El nombre no puede estar vacío!*';
    } else {
      await conn.groupUpdateSubject(m.chat, newName);
      m.reply(`*✅ ¡Nombre del grupo actualizado a: ${newName}!*`);
    }
  } catch (e) {
    throw '*❗ Ocurrió un error al intentar cambiar el nombre del grupo.*';
  }
};

handler.help = ['setname <text>'];
handler.tags = ['group'];
handler.command = /^(setname)$/i;
handler.group = true;
handler.admin = true;

export default handler;
