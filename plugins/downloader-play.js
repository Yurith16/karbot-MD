import yts from 'yt-search';

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  // Sistema de reacción - Indicar que el comando fue detectado
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

  if (!text) throw `🎵 *INGRESE EL NOMBRE O ENLACE DE YOUTUBE*\n\n*Ejemplo:*\n${usedPrefix + command} música relajante\n${usedPrefix + command} https://youtube.com/...`;      

  let downloadType = '';
  if (['play'].includes(command)) {
    downloadType = 'audio';
  } else if (['play2'].includes(command)) {
    downloadType = 'vídeo';
  }

  // Cambiar reacción a "buscando"
  await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

  const result = await search(args.join(' '));

  if (!result) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    throw `❌ *NO SE ENCONTRÓ EL VIDEO:* ${text}`;
  }

  const body = `🎬 *INFORMACIÓN DEL VIDEO - KARBOT-MD*\n
🔹 *Título:* ${result.title}
🔹 *Publicado:* ${result.ago}
🔹 *Duración:* ${result.duration.timestamp}
🔹 *Vistas:* ${formatNumber(result.views)}
🔹 *Canal:* ${result.author.name}
🔹 *ID:* ${result.videoId}
🔹 *Tipo:* ${result.type}
🔹 *URL:* ${result.url}

📥 *Descargando ${downloadType}, por favor espere...*`.trim();

  await conn.sendMessage(m.chat, { 
    image: { url: result.thumbnail }, 
    caption: body 
  }, { quoted: m });

  // Cambiar reacción a "descargando"
  await conn.sendMessage(m.chat, { react: { text: '📥', key: m.key } });

  const regex = "https://youtube.com/watch?v=";

  if (command === 'play') {
    try {
      const audiodlp = await tools.downloader.ytmp3(regex + result.videoId);
      const downloader = audiodlp.download;

      // Cambiar reacción a "enviando audio"
      await conn.sendMessage(m.chat, { react: { text: '🎵', key: m.key } });

      await conn.sendMessage(m.chat, { 
        audio: { url: downloader }, 
        mimetype: "audio/mpeg",
        fileName: `KARBOT-${result.title.substring(0, 50).replace(/[^\w\s]/gi, '')}.mp3`
      }, { quoted: m });

      // Reacción de éxito final
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (error) {
      console.log('Error descargando audio:', error);
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      throw `❌ *ERROR AL DESCARGAR EL AUDIO*\n\nEl video puede ser muy largo o estar restringido.`;
    }
  }

  if (command === 'play2') {
    try {
      const videodlp = await tools.downloader.ytmp4(regex + result.videoId);
      const downloader = videodlp.download;

      // Cambiar reacción a "enviando video"
      await conn.sendMessage(m.chat, { react: { text: '🎥', key: m.key } });

      await conn.sendMessage(m.chat, { 
        video: { url: downloader }, 
        mimetype: "video/mp4",
        fileName: `KARBOT-${result.title.substring(0, 50).replace(/[^\w\s]/gi, '')}.mp4`
      }, { quoted: m });

      // Reacción de éxito final
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (error) {
      console.log('Error descargando video:', error);
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      throw `❌ *ERROR AL DESCARGAR EL VIDEO*\n\nEl video puede ser muy largo, estar restringido o ser de alta resolución.`;
    }
  }
};

handler.help = ['play', 'play2'];
handler.tags = ['downloader'];
handler.command = /^(play|play2)$/i;

export default handler;

async function search(query, options = {}) {
  try {
    const search = await yts.search({
      query, 
      hl: 'es', 
      gl: 'ES', 
      ...options
    });
    return search.videos.length > 0 ? search.videos[0] : null;
  } catch (error) {
    console.error('Error en búsqueda YouTube:', error);
    return null;
  }
}

function formatNumber(num) {
  return num.toLocaleString('es-ES');
}