const handler = async (m, {conn, isPrems}) => {
  const hasil = Math.floor(Math.random() * 1000);
  const time = global.db.data.users[m.sender].lastmiming + 600000;

  if (new Date - global.db.data.users[m.sender].lastmiming < 600000) {
    const remainingTime = msToTime(time - new Date());
    throw `⏳ Espera ${remainingTime}`;
  }

  // Sistema de reacción
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '⛏️',
        key: m.key
      }
    });
  } catch (reactError) {}

  m.reply(`✅ +${hasil} XP`);
  global.db.data.users[m.sender].lastmiming = new Date() * 1;
};

handler.help = ['minar'];
handler.tags = ['xp'];
handler.command = ['minar', 'miming', 'mine'];
handler.fail = null;
handler.exp = 0;

export default handler;

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  return `${minutes}m ${seconds}s`;
}