/* Desarrollado y Creado por: HERNANDEZ - KARBOT-MD */

global.math = global.math ? global.math : {};

const handler = async (m, { conn }) => {
  const id = m.chat;
  if (!m.quoted) return;

  // Verificar que es un mensaje del juego de matemáticas
  if (!m.quoted.text || !m.quoted.text.includes('jrU022n8Vf')) return;

  if (!(m.chat in global.math)) return conn.reply(m.chat, `❌ *NO HAY JUEGO ACTIVO*`, m);

  if (m.quoted.id == global.math[id][0].id) {
    const math = global.math[id][1];

    // Convertir la respuesta del usuario a número
    let userAnswer;
    try {
      userAnswer = parseFloat(m.text.replace(/,/g, '.'));
    } catch (e) {
      userAnswer = null;
    }

    if (userAnswer !== null && userAnswer == math.result) {
      conn.reply(m.chat, `✅ *¡RESPUESTA CORRECTA!*\n✨ *Ganaste:* ${math.bonus} XP`, m);
      global.db.data.users[m.sender].exp += math.bonus;
      clearTimeout(global.math[id][3]);
      delete global.math[id];
    } else {
      if (--global.math[id][2] == 0) {
        conn.reply(m.chat, `⏰ *¡SE ACABARON LOS INTENTOS!*\n🔢 *La respuesta era:* ${math.result}`, m);
        clearTimeout(global.math[id][3]);
        delete global.math[id];
      } else {
        conn.reply(m.chat, `❌ *RESPUESTA INCORRECTA*\n🔄 *Intentos restantes:* ${global.math[id][2]}`, m);
      }
    }
  }
};

// Detectar números (enteros y decimales) como respuestas
handler.customPrefix = /^-?\d+(\.\d+)?$/;
handler.command = new RegExp;
export default handler;