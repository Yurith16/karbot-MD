const handler = async (m, {conn, args}) => {
  await conn.groupUpdateDescription(m.chat, `${args.join(' ')}`);
  m.reply('*✅ ¡La descripción del grupo se ha actualizado correctamente!*');
};

handler.help = ['setdesc <text>'];
handler.tags = ['group'];
handler.command = /^setdesc$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
