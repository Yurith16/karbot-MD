const handler = async (m, {conn, text, isROwner, isOwner}) => {
  if (text) {
    global.db.data.chats[m.chat].sBye = text;
    m.reply('*✅ ¡Mensaje de despedida establecido correctamente!*');
  } else throw `*⚠️ ¡Falta el texto!*\n\n*Ejemplo de uso:*\n*- setbye Adiós, @user, te extrañaremos mucho.*`;
};

handler.help = ['setbye <text>'];
handler.tags = ['group'];
handler.command = ['setbye'];
handler.admin = true;

export default handler;
