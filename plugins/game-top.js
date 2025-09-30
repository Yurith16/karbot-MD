import util from 'util';
import path from 'path';

const user = (a) => '@' + a.split('@s.whatsapp.net')[0];

function handler(m, { groupMetadata, command, conn, text, usedPrefix }) {
  if (!text) throw `🏆 *DEBES ESPECIFICAR UNA CATEGORÍA*\n*Ejemplo:* ${usedPrefix + command} más divertidos`;

  const ps = groupMetadata.participants.map((v) => v.jid);
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

  const emojis = ['🤓', '😅', '😂', '😳', '😎', '🥵', '😱', '🤑', '🙄', '💩', '🍑', '🤨', '🥴', '🔥', '👇🏻', '😔', '👀', '🌚'];
  const x = `${pickRandom(emojis)}`;

  const top = `🏆 *TOP 10 ${text.toUpperCase()}* 🏆\n\n` +
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

  m.reply(top, null, { mentions: [a, b, c, d, e, f, g, h, i, j] });
}

handler.help = ["top"];
handler.tags = ["game"];
handler.command = ["top", "ranking", "top10"];
handler.group = true;

export default handler;

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}