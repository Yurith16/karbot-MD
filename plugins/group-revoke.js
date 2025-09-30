/* Creador: HERNANDEZ */

const handler = async (m, {conn}) => {
  const revoke = await conn.groupRevokeInvite(m.chat);
  await conn.reply(m.chat, `*✅ ¡El enlace de invitación se ha restablecido con éxito!*
\n*🔗 Nuevo enlace:* ${'https://chat.whatsapp.com/' + revoke}`, m);
};

handler.help = ['revoke'];
handler.tags = ['group'];
handler.command = ['resetlink', 'revoke'];
handler.botAdmin = true;
handler.admin = true;
handler.group = true;

export default handler;