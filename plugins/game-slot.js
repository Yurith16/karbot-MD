/* Desarrollado y Creado por: HERNANDEZ - KARBOT-MD */

const handler = async (m, {args, usedPrefix, command}) => {
  const fa = `🎰 *TRAGAMONEDAS - KARBOT-MD*\n\n*Apuesta mínima:* 100 XP\n\n*Ejemplo:*\n*${usedPrefix + command} 100*`;

  if (!args[0]) throw fa;
  if (isNaN(args[0])) throw fa;

  const apuesta = parseInt(args[0]);
  const users = global.db.data.users[m.sender];
  const time = users.lastslot + 10000;

  if (new Date - users.lastslot < 10000) throw `⏰ *DEBES ESPERAR* ${msToTime(time - new Date())} *PARA JUGAR DE NUEVO*`;
  if (apuesta < 100) throw `❌ *APUESTA MÍNIMA: 100 XP*`;
  if (users.exp < apuesta) throw `❌ *NO TIENES SUFICIENTE XP*`;

  const emojis = ['🐋', '🐉', '🕊️', '⭐', '💎', '🍒'];
  let a = Math.floor(Math.random() * emojis.length);
  let b = Math.floor(Math.random() * emojis.length);
  let c = Math.floor(Math.random() * emojis.length);

  const x = [];
  const y = [];
  const z = [];

  for (let i = 0; i < 3; i++) {
    x[i] = emojis[a];
    a++;
    if (a == emojis.length) a = 0;
  }

  for (let i = 0; i < 3; i++) {
    y[i] = emojis[b];
    b++;
    if (b == emojis.length) b = 0;
  }

  for (let i = 0; i < 3; i++) {
    z[i] = emojis[c];
    c++;
    if (c == emojis.length) c = 0;
  }

  let end;
  let xpChange = 0;

  if (a == b && b == c) {
    // JACKPOT - 3 emojis iguales
    xpChange = apuesta * 2;
    end = `🎉 *¡JACKPOT!* +${xpChange} XP`;
    users.exp += xpChange;
  } else if (a == b || a == c || b == c) {
    // 2 emojis iguales - pequeña ganancia
    xpChange = 50;
    end = `✨ *¡CASI!* +${xpChange} XP`;
    users.exp += xpChange;
  } else {
    // Perder
    xpChange = apuesta;
    end = `💥 *PERDISTE* -${xpChange} XP`;
    users.exp -= xpChange;
  }

  users.lastslot = new Date * 1;

  return await m.reply(
      `
╔══════════════════╗
         🎰 *TRAGAMONEDAS* 🎰
╚══════════════════╗

${x[0]} : ${y[0]} : ${z[0]}
${x[1]} : ${y[1]} : ${z[1]}  
${x[2]} : ${y[2]} : ${z[2]}

╔══════════════════╗
         ${end}
╚══════════════════╝`);
};

handler.help = ['slot <apuesta>'];
handler.tags = ['game'];
handler.command = ['slot', 'tragamonedas', 'maquina'];
export default handler;

function msToTime(duration) {
  const milliseconds = parseInt((duration % 1000) / 100);
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? '0' + hours : hours;
  minutes = (minutes < 10) ? '0' + minutes : minutes;
  seconds = (seconds < 10) ? '0' + seconds : seconds;

  return minutes + ' m ' + seconds + ' s ';
}
