/* Desarrollado y Creado por: HERNANDEZ - KARBOT-MD */

global.math = global.math ? global.math : {};

const handler = async (m, {conn, args, usedPrefix, command}) => {
  const mat = `🧮 *JUEGO DE MATEMÁTICAS - KARBOT-MD*\n\n*Modos disponibles:*\n• ${Object.keys(modes).join('\n• ')}\n\n*Ejemplo:* ${usedPrefix + command} medium`;

  if (args.length < 1) return await conn.reply(m.chat, mat, m);

  const mode = args[0].toLowerCase();
  if (!(mode in modes)) return await conn.reply(m.chat, mat, m);

  const id = m.chat;
  if (id in global.math) return conn.reply(m.chat, `🎯 *JUEGO YA ACTIVO EN ESTE CHAT*`, global.math[id][0]);

  const math = genMath(mode);

  // Mensaje con identificador único para las respuestas
  const mathMessage = `🧠 *DESAFÍO MATEMÁTICO*\n\n` +
    `🔢 *Problema:* ${math.str}\n` +
    `⏰ *Tiempo:* ${(math.time / 1000).toFixed(2)} segundos\n` +
    `🏆 *Recompensa:* ${math.bonus} XP\n\n` +
    `💡 *Responde con el resultado correcto*\n\n` +
    `jrU022n8Vf`; // Identificador único para las respuestas

  global.math[id] = [
    await conn.reply(m.chat, mathMessage, m),
    math, 
    3, // 3 intentos
    setTimeout(() => {
      if (global.math[id]) {
        conn.reply(m.chat, `⏰ *¡TIEMPO AGOTADO!*\n🔢 *La respuesta era:* ${math.result}`, global.math[id][0]);
        delete global.math[id];
      }
    }, math.time),
  ];
};

handler.help = ['math'];
handler.tags = ['game'];
handler.command = /^math|mates|matemáticas|matematicas$/i;
export default handler;

const modes = {
  noob: [-3, 3, -3, 3, '+-', 15000, 10],
  easy: [-10, 10, -10, 10, '*/+-', 20000, 40],
  medium: [-40, 40, -20, 20, '*/+-', 40000, 150],
  hard: [-100, 100, -70, 70, '*/+-', 60000, 350],
  extreme: [-999999, 999999, -999999, 999999, '*/', 99999, 9999],
  impossible: [-99999999999, 99999999999, -99999999999, 999999999999, '*/', 30000, 35000],
  impossible2: [-999999999999999, 999999999999999, -999, 999, '/', 30000, 50000],
};

const operators = {
  '+': '+',
  '-': '-', 
  '*': '×',
  '/': '÷',
};

function genMath(mode) {
  const [a1, a2, b1, b2, ops, time, bonus] = modes[mode];
  let a = randomInt(a1, a2);
  const b = randomInt(b1, b2);
  const op = pickRandom([...ops]);
  let result = (new Function(`return ${a} ${op.replace('/', '*')} ${b < 0 ? `(${b})` : b}`))();
  if (op == '/') [a, result] = [result, a];
  return {
    str: `${a} ${operators[op]} ${b}`,
    mode,
    time,
    bonus,
    result,
  };
}

function randomInt(from, to) {
  if (from > to) [from, to] = [to, from];
  from = Math.floor(from);
  to = Math.floor(to);
  return Math.floor((to - from) * Math.random() + from);
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}