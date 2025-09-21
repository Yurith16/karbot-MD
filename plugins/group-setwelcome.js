const handler = async (m, {conn, text, isROwner, isOwner}) => {
  if (text) {
    global.db.data.chats[m.chat].sWelcome = text;
    m.reply('*✅ ¡Mensaje de bienvenida establecido correctamente!*');
  } else throw `*⚠️ ¡Falta el texto!*
\n*Ejemplo de uso:*
\n*- setwelcome ¡Hola, @user! Bienvenido al grupo @group, diviértete.*
\n*Variables disponibles:*
*- @user (menciona al nuevo miembro)*
*- @group (nombre del grupo)*
*- @desc (descripción del grupo)*`;
};

handler.help = ['setwelcome <text>'];
handler.tags = ['group'];
handler.command = ['setwelcome'];
handler.admin = true;

export default handler;
