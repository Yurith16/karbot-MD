/* Desarrollado y Creado por: HERNANDEZ - KARBOT-MD */

import yts from 'yt-search';

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  // Sistema de reacción - Indicar que el comando fue detectado
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.descargas_play;

  if (!text) throw `🎵 *INGRESE EL NOMBRE O ENLACE DE YOUTUBE*\n*Ejemplo:* ${usedPrefix + command} música relajante`;      

  let additionalText = '';
  if (['play'].includes(command)) {
    additionalText = 'audio';
  } else if (['play2'].includes(command)) {
    additionalText = 'vídeo';
  }

  // Cambiar reacción a "buscando"
  await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

  const regex = "https://youtube.com/watch?v=";
  const result = await search(args.join(' '));

  if (!result) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    throw `❌ *NO SE ENCONTRÓ EL VIDEO: ${text}*`;
  }

  const body = `🎬 *INFORMACIÓN DEL VIDEO*\n
🔹 *Título:* ${result.title}
🔹 *Publicado:* ${result.ago}
🔹 *Duración:* ${result.duration.timestamp}
🔹 *Vistas:* ${formatNumber(result.views)}
🔹 *Canal:* ${result.author.name}
🔹 *ID:* ${result.videoId}
🔹 *Tipo:* ${result.type}
🔹 *URL:* ${result.url}
🔹 *Canal URL:* ${result.author.url}

📥 *Descargando ${additionalText}, por favor espere...*`.trim();

  conn.sendMessage(m.chat, { image: { url: result.thumbnail }, caption: body }, { quoted: m });

  // Cambiar reacción a "descargando"
  await conn.sendMessage(m.chat, { react: { text: '📥', key: m.key } });

  if (command === 'play') {
    try {
      const audiodlp = await tools.downloader.ytmp3(regex + result.videoId);
      const downloader = audiodlp.download;

      // Cambiar reacción a "enviando audio"
      await conn.sendMessage(m.chat, { react: { text: '🎵', key: m.key } });

      conn.sendMessage(m.chat, { 
        audio: { url: downloader }, 
        mimetype: "audio/mpeg",
        fileName: `KARBOT-${result.title.substring(0, 50)}.mp3`
      }, { quoted: m });

      // Reacción de éxito
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (error) {
      console.log(error);
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      throw `❌ *ERROR AL DESCARGAR EL AUDIO*`;
    }
  }

  if (command === 'play2') {
    try {
      const videodlp = await tools.downloader.ytmp4(regex + result.videoId);
      const downloader = videodlp.download;

      // Cambiar reacción a "enviando video"
      await conn.sendMessage(m.chat, { react: { text: '🎥', key: m.key } });

      conn.sendMessage(m.chat, { 
        video: { url: downloader }, 
        mimetype: "video/mp4",
        fileName: `KARBOT-${result.title.substring(0, 50)}.mp4`
      }, { quoted: m });

      // Reacción de éxito
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (error) {
      console.log(error);
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      throw `❌ *ERROR AL DESCARGAR EL VIDEO*`;
    }
  }
};

handler.help = ['play', 'play2'];
handler.tags = ['downloader'];
//handler.command = ['play', 'play2'];

export default handler;

async function search(query, options = {}) {
  try {
    const search = await yts.search({query, hl: 'es', gl: 'ES', ...options});
    return search.videos[0];
  } catch (error) {
    console.error('Error en búsqueda YouTube:', error);
    return null;
  }
}

function formatNumber(num) {
  return num.toLocaleString();
}