import util from 'util';
import path from 'path';

const user = (a) => '@' + a.split('@')[0];

function handler(m, {groupMetadata, command, conn, participants}) {
  const ps = groupMetadata.participants.map((v) => v.id);
  const a = ps.getRandom();
  const b = ps.getRandom();
  const c = ps.getRandom();
  const d = ps.getRandom();
  const e = ps.getRandom();
  const f = ps.getRandom();
  const g = ps.getRandom();
  const h = ps.getRandom();
  const i = ps.getRandom();
  const j = ps.getRandom();

  if (command == 'topgays') {
    const vn = './src/assets/audio/01J673A5RN30C5EYPMKE5MR9XQ.mp3';
    const top = `🏳️‍🌈 *TOP 10 GAYS DEL GRUPO* 🏳️‍🌈\n\n` +
                `🥇 *1.* ${user(a)}\n` +
                `🥈 *2.* ${user(b)}\n` +
                `🥉 *3.* ${user(c)}\n` +
                `4️⃣ *4.* ${user(d)}\n` +
                `5️⃣ *5.* ${user(e)}\n` +
                `6️⃣ *6.* ${user(f)}\n` +
                `7️⃣ *7.* ${user(g)}\n` +
                `8️⃣ *8.* ${user(h)}\n` +
                `9️⃣ *9.* ${user(i)}\n` +
                `🔟 *10.* ${user(j)}\n\n` +
                `✨ *Lista generada por KARBOT-MD* ✨`;

    m.reply(top, null, {mentions: [a, b, c, d, e, f, g, h, i, j]});
    conn.sendMessage(m.chat, {
      audio: {url: vn}, 
      fileName: 'karbot-topgays.mp3', 
      mimetype: 'audio/mpeg', 
      ptt: true
    }, {quoted: m});
  }

  if (command == 'topotakus') {
    const vn = './src/assets/audio/01J67441AFAPG1YRQXDQ0VDTZB.mp3';
    const top = `🎌 *TOP 10 OTAKUS DEL GRUPO* 🎌\n\n` +
                `🥇 *1.* ${user(a)}\n` +
                `🥈 *2.* ${user(b)}\n` +
                `🥉 *3.* ${user(c)}\n` +
                `4️⃣ *4.* ${user(d)}\n` +
                `5️⃣ *5.* ${user(e)}\n` +
                `6️⃣ *6.* ${user(f)}\n` +
                `7️⃣ *7.* ${user(g)}\n` +
                `8️⃣ *8.* ${user(h)}\n` +
                `9️⃣ *9.* ${user(i)}\n` +
                `🔟 *10.* ${user(j)}\n\n` +
                `✨ *Lista generada por KARBOT-MD* ✨`;

    m.reply(top, null, {mentions: [a, b, c, d, e, f, g, h, i, j]});
    conn.sendMessage(m.chat, {
      audio: {url: vn}, 
      fileName: 'karbot-topotakus.mp3', 
      mimetype: 'audio/mpeg', 
      ptt: true
    }, {quoted: m});
  }
}

handler.help = handler.command = ['topgays', 'topotakus'];
handler.tags = ['game'];
handler.group = true;
export default handler;