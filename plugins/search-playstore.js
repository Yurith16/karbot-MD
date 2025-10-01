import gplay from "google-play-scraper";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // Sistema de reacción - indicar procesamiento
  await conn.sendMessage(m.chat, { react: { text: '📱', key: m.key } });

  if (!text) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    throw `*📱 FALTA EL NOMBRE DE LA APLICACIÓN*\n\n_Escribe el nombre de la app que quieres buscar en Play Store_\n\n*Ejemplo:*\n*${usedPrefix + command} whatsapp*\n*${usedPrefix + command} facebook lite*`;
  }

  try {
    // Reacción de búsqueda
    await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

    let res = await gplay.search({ term: text });

    if (!res.length) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      throw `*❌ APLICACIÓN NO ENCONTRADA*\n\n_No se encontraron resultados para: ${text}_\n\n*Sugerencias:*\n• Verifica el nombre\n• Intenta con términos más específicos`;
    }

    // Reacción de éxito
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    let opt = {
      contextInfo: {
        externalAdReply: {
          title: res[0].title,
          body: res[0].summary,
          thumbnail: (await conn.getFile(res[0].icon)).data,
          sourceUrl: res[0].url,
          mediaType: 1,
          renderLargerThumbnail: true
        },
      },
    };

    console.log('Resultados Play Store:', res);

    res = res.slice(0, 5).map((v, index) =>
      `*${index + 1}. ${v.title}*\n
📱 *Desarrollador:* ${v.developer}
💰 *Precio:* ${v.priceText || 'Gratis'}
⭐ *Calificación:* ${v.scoreText || 'Sin calificaciones'}
📥 *Descargar:* ${v.url}
📊 *Reseñas:* ${v.reviews || 'No disponible'}
🔄 *Actualizado:* ${v.updated || 'No disponible'}`
    ).join('\n\n' + '─'.repeat(30) + '\n\n');

    m.reply(`*🛍️ RESULTADOS PLAY STORE*\n\n*Búsqueda:* ${text}\n\n${res}`, null, opt);

  } catch (error) {
    // Reacción de error
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    console.error('Error en playstore:', error);

    if (error.message.includes('timeout')) {
      m.reply('*⏰ TIEMPO DE ESPERA AGOTADO*\n\n_La búsqueda tardó demasiado. Intenta nuevamente._');
    } else if (error.message.includes('network') || error.message.includes('connect')) {
      m.reply('*🌐 ERROR DE CONEXIÓN*\n\n_No se pudo conectar con Play Store. Verifica tu conexión._');
    } else {
      m.reply('*❌ ERROR EN LA BÚSQUEDA*\n\n_Ocurrió un error al buscar en Play Store. Intenta más tarde._');
    }
  }
};

handler.help = ['playstore <aplicación>'];
handler.tags = ['internet'];
handler.command = /^(playstore|playstoresearch|appstore|buscarapp)$/i;
export default handler;