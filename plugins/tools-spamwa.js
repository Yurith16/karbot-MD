const handler = async (m, {conn, text}) => {
  // Sistema de reacción - indicar procesamiento
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

  const [numero, mensaje, cantidad] = text.split('|');

  if (!numero) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    throw `*🚫 FALTA EL NÚMERO*\n\n_Ejemplo: ${usedPrefix}spam 1234567890|Hola mundo|5_`;
  }

  if (!mensaje) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    throw `*🚫 FALTA EL MENSAJE*\n\n_Ejemplo: ${usedPrefix}spam 1234567890|Hola mundo|5_`;
  }

  if (cantidad && isNaN(cantidad)) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    throw `*🚫 CANTIDAD INVÁLIDA*\n\n_La cantidad debe ser un número válido_`;
  }

  const numeroFormateado = numero.replace(/[-+<>@]/g, '').replace(/ +/g, '').replace(/^[0]/g, '62') + '@s.whatsapp.net';
  const cantidadFinal = cantidad ? cantidad * 1 : 10;

  if (cantidadFinal > 30) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    throw `*🚫 LÍMITE EXCEDIDO*\n\n_Máximo 30 mensajes por comando_`;
  }

  // Reacción de procesamiento
  await conn.sendMessage(m.chat, { react: { text: '📤', key: m.key } });

  await m.reply(`*📤 INICIANDO SPAM*\n\n*📱 Número:* ${numero}\n*💬 Mensaje:* ${mensaje.trim()}\n*🔢 Cantidad:* ${cantidadFinal} mensajes\n\n_Enviando mensajes..._`);

  let enviados = 0;
  let errores = 0;

  for (let i = 0; i < cantidadFinal; i++) {
    try {
      await conn.reply(numeroFormateado, `${mensaje.trim()}\n\n*[${i + 1}/${cantidadFinal}]*`, null);
      enviados++;

      // Pequeña pausa entre mensajes para evitar bloqueos
      if (i < cantidadFinal - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      errores++;
      console.error(`Error enviando mensaje ${i + 1}:`, error);
    }
  }

  // Reacción de éxito/error
  if (errores === 0) {
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    await m.reply(`*✅ SPAM COMPLETADO*\n\n*📱 Número:* ${numero}\n*✅ Mensajes enviados:* ${enviados}/${cantidadFinal}\n*🚫 Errores:* ${errores}\n\n_Todos los mensajes fueron enviados exitosamente_`);
  } else {
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
    await m.reply(`*⚠️ SPAM PARCIALMENTE COMPLETADO*\n\n*📱 Número:* ${numero}\n*✅ Mensajes enviados:* ${enviados}/${cantidadFinal}\n*🚫 Errores:* ${errores}\n\n_Algunos mensajes no pudieron ser enviados_`);
  }
};

handler.help = ['spamwa <número>|<mensaje>|<cantidad>'];
handler.tags = ['tools'];
handler.command = /^spam(wa)?$/i;
handler.group = false;
handler.premium = true;
// handler.private = true
// handler.limit = true
export default handler;