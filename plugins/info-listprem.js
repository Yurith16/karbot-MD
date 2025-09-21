/* Creador: HERNANDEZ */

import fs from 'fs';

const handler = async (m, { conn, args, isPrems }) => {
  function clockString(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    return `*${days}* días, *${hours % 24}* horas, *${minutes % 60}* minutos, *${seconds % 60}* segundos`;
  }

  const usuario = global.db.data.users[m.sender].premiumTime;
  const user = Object.entries(global.db.data.users).filter((user) => user[1].premiumTime).map(([key, value]) => {
    return { ...value, jid: key };
  });

  const prem = global.db.data.users[m.sender].premium;
  const userr = '@' + m.sender.split`@`[0];

  const sortedP = user.map(toNumber('premiumTime')).sort(sort('premiumTime'));
  const len = args[0] && args[0].length > 0 ? Math.min(100, Math.max(parseInt(args[0]), 10)) : Math.min(10, sortedP.length);

  let infoprem = `╭─「 👑 *LISTA DE USUARIOS PREMIUM* 👑 」
│
│ *Tú:* ${userr}
│ *Estado:* ${prem ? `✅ Premium` : `❌ No eres premium`}
│ *Tiempo restante:* ${prem ? `${clockString(usuario - new Date() * 1)}` : 'N/A'}
│
│ *TOP ${len} Usuarios Premium:*
${sortedP.slice(0, len).map(({ jid, premiumTime }, i) => `│ 📌 ${i + 1}. *@${jid.split`@`[0]}*\n│    ↳ *Tiempo restante:* ${clockString(premiumTime - new Date() * 1)}`).join('\n')}`.trim();

  if (sortedP.filter((user) => user.premiumTime).length === 0) {
    infoprem = `*❌ No hay usuarios premium en la base de datos.*`;
  }

  m.reply(infoprem, null, { mentions: conn.parseMention(infoprem) });
};

handler.help = ['premlist'];
handler.tags = ['info'];
handler.command = /^(listaprem|premlista|listavip|viplista)$/i;
export default handler;

function sort(property, ascending = true) {
  if (property) return (...args) => args[ascending & 1][property] - args[!ascending & 1][property];
  else return (...args) => args[ascending & 1] - args[!ascending & 1];
}

function toNumber(property, _default = 0) {
  if (property) {
    return (a, i, b) => {
      return { ...b[i], [property]: a[property] === undefined ? _default : a[property] };
    };
  } else return (a) => a === undefined ? _default : a;
}