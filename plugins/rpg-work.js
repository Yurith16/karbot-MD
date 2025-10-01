const handler = async (m, { conn, isPrems }) => {
  // Sistema de reacción - indicar procesamiento
  await conn.sendMessage(m.chat, { react: { text: '⚔️', key: m.key } });

  let enviando;
  if (enviando) return
  enviando = true

  const trabajos = [
    "𝙀𝙢𝙥𝙪𝙟𝙖𝙨 𝙪𝙣𝙖 𝙥𝙞𝙚𝙙𝙧𝙖 𝙜𝙞𝙜𝙖𝙣𝙩𝙚 𝙚𝙣 𝙡𝙖 𝙢𝙤𝙣𝙩𝙖ñ𝙖 🗿",
    "𝘿𝙚𝙧𝙧𝙤𝙩𝙖𝙨 𝙪𝙣 𝙟𝙚𝙛𝙚 𝙛𝙞𝙣𝙖𝙡 𝙚𝙥𝙞𝙘𝙤 🐉",
    "𝙍𝙚𝙘𝙤𝙜𝙚𝙨 𝙝𝙚𝙧𝙗𝙖𝙨 𝙢á𝙜𝙞𝙘𝙖𝙨 𝙚𝙣 𝙚𝙡 𝙗𝙤𝙨𝙦𝙪𝙚 🌿",
    "𝙍𝙚𝙨𝙘𝙖𝙩𝙖𝙨 𝙖 𝙪𝙣 𝙖𝙡𝙙𝙚𝙖𝙣𝙤 𝙙𝙚 𝙡𝙖𝙨 𝙜𝙖𝙧𝙧𝙖𝙨 🏰",
    "𝘿𝙚𝙨𝙖𝙘𝙩𝙞𝙫𝙖𝙨 𝙪𝙣𝙖 𝙩𝙧𝙖𝙢𝙥𝙖 𝙢𝙤𝙧𝙩𝙖𝙡 🔓",
    "𝘾𝙪𝙧𝙖𝙨 𝙖 𝙡𝙤𝙨 𝙝𝙚𝙧𝙞𝙙𝙤𝙨 𝙚𝙣 𝙡𝙖 𝙗𝙖𝙩𝙖𝙡𝙡𝙖 🩹",
    "𝙀𝙣𝙘𝙪𝙚𝙣𝙩𝙧𝙖𝙨 𝙪𝙣 𝙩𝙚𝙨𝙤𝙧𝙤 𝙤𝙘𝙪𝙡𝙩𝙤 💎",
    "𝘿𝙚𝙧𝙧𝙤𝙩𝙖𝙨 𝙪𝙣 𝙚𝙟é𝙧𝙘𝙞𝙩𝙤 𝙙𝙚 𝙣𝙤 𝙢𝙪𝙚𝙧𝙩𝙤𝙨 💀",
    "𝙋𝙧𝙤𝙩𝙚𝙜𝙚𝙨 𝙖𝙡 𝙥𝙪𝙚𝙗𝙡𝙤 𝙙𝙚 𝙪𝙣 𝙙𝙧𝙖𝙜ó𝙣 🛡️",
    "𝘾𝙤𝙢𝙥𝙡𝙚𝙩𝙖𝙨 𝙪𝙣𝙖 𝙢𝙞𝙨𝙞ó𝙣 𝙙𝙚 𝙖𝙡𝙩𝙖 𝙥𝙚𝙡𝙞𝙜𝙧𝙤 ⚡"
  ];

  const hasil = Math.floor(Math.random() * 5000);
  const time = global.db.data.users[m.sender].lastwork + 600000;

  if (new Date - global.db.data.users[m.sender].lastwork < 600000) {
    enviando = false;
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
    throw `⚔️ *¡𝙀𝙨𝙥𝙚𝙧𝙖 𝙪𝙣 𝙢𝙤𝙢𝙚𝙣𝙩𝙤 𝙥𝙚𝙦𝙪𝙚ñ𝙤 𝙖𝙫𝙚𝙣𝙩𝙪𝙧𝙚𝙧𝙤!* ⚔️\n\n┌───「⏰ 𝙏𝙄𝙀𝙈𝙋𝙊 𝙍𝙀𝙎𝙏𝘼𝙉𝙏𝙀 」─\n▸ 𝙍𝙚𝙜𝙧𝙚𝙨𝙖 𝙚𝙣: ${msToTime(time - new Date())}\n└───────────────────────`;
  }

  // Reacción de trabajo completado
  await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  conn.sendMessage(m.chat, { 
    text: `┌───「🏞️ 𝘼𝙑𝙀𝙉𝙏𝙐𝙍𝘼 𝙀𝙋𝙄𝘾𝘼 」─\n▸ ${pickRandom(trabajos)}\n├───「⭐ 𝙍𝙀𝘾𝙊𝙈𝙋𝙀𝙉𝙎𝘼 」─\n▸ 𝙂𝙖𝙣𝙖𝙨𝙩𝙚: ${hasil} 𝙚𝙭𝙥\n└───────────────────────` 
  }, { quoted: m });

  global.db.data.users[m.sender].exp += hasil;
  global.db.data.users[m.sender].lastwork = new Date() * 1;
  enviando = false
};

handler.help = ['work'];
handler.tags = ['xp'];
handler.command = /^(work|trabajar|chambear|aventura|mision)$/i
handler.fail = null;
export default handler;

function msToTime(duration) {
  const milliseconds = parseInt((duration % 1000) / 100);
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  hours = (hours < 10) ? '0' + hours : hours;
  minutes = (minutes < 10) ? '0' + minutes : minutes;
  seconds = (seconds < 10) ? '0' + seconds : seconds;
  return minutes + ' 𝙢𝙞𝙣𝙪𝙩𝙤𝙨 ' + seconds + ' 𝙨𝙚𝙜𝙪𝙣𝙙𝙤𝙨 ';
}

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())];
}