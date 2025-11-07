/* Karbot - Buscar Imágenes */

import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text) {
      return await conn.sendMessage(m.chat, {
        text: `*「🖼️」 Buscar Imágenes*\n\n> ✦ *Ingresa el nombre de la imagen:*\n> ✦ *Ejemplo:* » ${usedPrefix + command} paisajes`
      }, { quoted: m });
    }

    // Reacción de búsqueda
    await conn.sendMessage(m.chat, {
      react: { text: '🔍', key: m.key }
    });

    const api = await axios.get(`${global.BASE_API_DELIRIUS}/search/gimage?query=${encodeURIComponent(text)}`);
    const data = api.data.data;

    // Filtrar solo imágenes válidas
    const filteredData = data.filter(image => {
      if (!image.url) return false;
      const url = image.url.toLowerCase();
      return url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') || url.includes('image');
    });

    if (filteredData.length === 0) {
      await conn.sendMessage(m.chat, {
        react: { text: '❌', key: m.key }
      });
      return await conn.sendMessage(m.chat, {
        text: `*「❌」 No se encontraron imágenes*\n\n> ✦ *Búsqueda:* » ${text}\n> ✦ *Solución:* » Intenta con otros términos`
      }, { quoted: m });
    }

    // Tomar las primeras 5 imágenes
    const selectedImages = filteredData.slice(0, 5);

    await conn.sendMessage(m.chat, {
      react: { text: '📥', key: m.key }
    });

    // Mensaje informativo
    await conn.sendMessage(m.chat, {
      text: `*「📸」 Enviando Imágenes*\n\n> ✦ *Búsqueda:* » ${text}\n> ✦ *Cantidad:* » 5 imágenes`
    }, { quoted: m });

    // Enviar las 5 imágenes
    for (let i = 0; i < selectedImages.length; i++) {
      const image = selectedImages[i];

      await conn.sendMessage(m.chat, {
        image: { url: image.url },
        caption: i === 0 ? 
          `*「🖼️」 ${text}*\n\n> ✦ *Imagen:* » ${i + 1}/5\n> ✦ *Fuente:* » ${image.origin?.website?.url || 'Google Images'}` :
          `*「🖼️」 Imagen ${i + 1}/5*`
      });

      // Pequeña pausa entre envíos
      if (i < selectedImages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Reacción de éxito
    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    });

  } catch (error) {
    console.error('Error en búsqueda de imágenes:', error);

    await conn.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    });

    await conn.sendMessage(m.chat, {
      text: `*「❌」 Error en Búsqueda*\n\n> ✦ *Error:* » ${error.message}\n> ✦ *Solución:* » Intenta más tarde`
    }, { quoted: m });
  }
};

handler.help = ['imagen', 'img', 'image', 'gimage'];
handler.tags = ['internet', 'tools'];
handler.command = ['imagen', 'img', 'image', 'gimage'];

export default handler;