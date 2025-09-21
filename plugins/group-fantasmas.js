const handler = async (m, {conn, text, participants}) => {
  const member = participants.map((u) => u.id);

  if (!text) {
    var sum = member.length;
  } else {
    var sum = text;
  }

  let total = 0;
  const sider = [];

  for (let i = 0; i < sum; i++) {
    const users = m.isGroup ? participants.find((u) => u.id == member[i]) : {};

    if ((typeof global.db.data.users[member[i]] == 'undefined' || global.db.data.users[member[i]].chat == 0) && !users.admin && !users.isSuperAdmin) {
      if (typeof global.db.data.users[member[i]] !== 'undefined') {
        if (global.db.data.users[member[i]].whitelist == false) {
          total++;
          sider.push(member[i]);
        }
      } else {
        total++;
        sider.push(member[i]);
      }
    }
  }

  if (total == 0) {
    return conn.reply(m.chat, 
      `✅ *NO HAY FANTASMAS EN EL GRUPO*\n\n` +
      `✨ Todos los miembros han interactuado al menos una vez`,
    m);
  }

  const groupName = await conn.getName(m.chat);

  m.reply(
    `👻 *DETECCIÓN DE FANTASMAS - KARBOT-MD* 👻\n\n` +
    `🏷️ *Grupo:* ${groupName}\n` +
    `👥 *Miembros verificados:* ${sum}\n\n` +
    `🔍 *Usuarios inactivos (fantasmas):* ${total}\n\n` +
    `${sider.map((v, i) => `  ${i + 1}. 👉🏻 @${v.replace(/@.+/, '')}`).join('\n')}\n\n` +
    `💡 *Estos usuarios no han interactuado con el bot*`,
  null, {mentions: sider});
};

handler.help = ['fantasmas'];
handler.tags = ['group'];
handler.command = /^(verfantasmas|fantasmas|sider|inactivos|fantasma)$/i;
handler.admin = true;
handler.botAdmin = true;
export default handler;
