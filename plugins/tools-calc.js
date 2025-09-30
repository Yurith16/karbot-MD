const handler = async (m, {conn, text, usedPrefix, command}) => {
  // Sistema de reacción - indicar procesamiento
  await conn.sendMessage(m.chat, { react: { text: '🧮', key: m.key } });

  const id = m.chat;
  conn.math = conn.math ? conn.math : {};

  // Cancelar cálculo anterior si existe
  if (id in conn.math) {
    clearTimeout(conn.math[id][3]);
    delete conn.math[id];
    await conn.sendMessage(m.chat, { react: { text: '🗑️', key: m.key } });
    m.reply('*🔄 CÁLCULO ANTERIOR CANCELADO*\n\n_Puedes empezar un nuevo cálculo._');
    return;
  }

  if (!text) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    throw `*🧮 FALTA LA EXPRESIÓN*\n\n_Escribe la operación matemática después del comando_\n\n*Ejemplos:*\n*${usedPrefix + command} 5+3*\n*${usedPrefix + command} 15*2.5\n*${usedPrefix + command} (10+5)/3*\n*${usedPrefix + command} π*5^2*`;
  }

  try {
    // Reacción de procesamiento
    await conn.sendMessage(m.chat, { react: { text: '🔢', key: m.key } });

    const val = text
      .replace(/[^0-9\-\/+*×÷πEe()piPI/]/g, '')
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π|pi/gi, 'Math.PI')
      .replace(/e/gi, 'Math.E')
      .replace(/\/+/g, '/')
      .replace(/\++/g, '+')
      .replace(/-+/g, '-');

    const format = val
      .replace(/Math\.PI/g, 'π')
      .replace(/Math\.E/g, 'e')
      .replace(/\//g, '÷')
      .replace(/\*×/g, '×');

    console.log('Expresión a calcular:', val);
    const result = (new Function('return ' + val))();

    if (!result && result !== 0) throw new Error('Resultado inválido');

    // Reacción de éxito
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    m.reply(`*🧮 CALCULADORA*\n\n*Expresión:* ${format}\n*Resultado:* _${result}_`);

  } catch (e) {
    // Reacción de error
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

    if (e == undefined || e.message?.includes('inválido')) {
      throw `*❌ EXPRESIÓN INVÁLIDA*\n\n_La operación matemática no es válida._\n\n*Ejemplos correctos:*\n• 5+3\n• 15*2.5\n• (10+5)/3\n• π*5^2`;
    } else {
      throw `*❌ ERROR EN EL CÁLCULO*\n\n_No se pudo calcular la expresión. Verifica la sintaxis._`;
    }
  }
};

handler.help = ['calc <expresión>'];
handler.tags = ['tools'];
handler.command = /^(calc(ulat(e|or))?|kalk(ulator)?|calculadora|calcular)$/i;
handler.exp = 5;
export default handler;