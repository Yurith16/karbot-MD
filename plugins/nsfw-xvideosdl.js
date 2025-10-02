import fetch from 'node-fetch';
import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs'; // Asegúrate de importar 'fs' si lo necesitas

const handler = async (m, { conn, args, command, usedPrefix, text }) => {
  // --- Textos estáticos (sin traducción) ---
  const HORNY_MODE_DISABLED = `⚠️ El modo caliente no está activado en este chat. Actívalo con: *#enable modohorny*`;
  const NO_URL_PROVIDED = `❌ Por favor, proporciona un enlace de Xvideos. Ejemplo: ${usedPrefix + command} https://www.xvideos.com/video70389849/pequena_zorra_follada_duro`;
  const DOWNLOADING_MESSAGE = '⏳ Descargando video... Esto puede tomar un momento.';
  const ERROR_MESSAGE = '❌ Ocurrió un error al descargar el video. Verifica el enlace. Ejemplo:';
  const EXAMPLE_URL = '*◉ https://www.xvideos.com/video70389849/pequena_zorra_follada_duro*';

  // Variables para reacciones
  const reactionStart = '⏳';
  const reactionSuccess = '✅';
  const reactionError = '❌';

  // 1. Verificar el modo caliente
  if (!db.data.chats[m.chat].modohorny && m.isGroup) {
      // Reacción de error antes de lanzar el throw
      await conn.sendMessage(m.chat, { react: { text: reactionError, key: m.key } });
      throw HORNY_MODE_DISABLED;
  }

  // 2. Verificar el argumento
  if (!args[0]) {
      // Reacción de error antes de lanzar el throw
      await conn.sendMessage(m.chat, { react: { text: reactionError, key: m.key } });
      throw NO_URL_PROVIDED;
  }

  // 3. Iniciar descarga
  try {
    // Reacción de inicio
    await conn.sendMessage(m.chat, { react: { text: reactionStart, key: m.key } });

    conn.reply(m.chat, DOWNLOADING_MESSAGE, m);

    const res = await xvideosdl(args[0]);

    // Envía el video como documento
    await conn.sendMessage(m.chat, { 
        document: { url: res.result.url }, 
        mimetype: 'video/mp4', 
        fileName: res.result.title + '.mp4' // Agregando extensión para asegurar que se guarde como video
    }, { quoted: m });

    // Reacción de éxito
    await conn.sendMessage(m.chat, { react: { text: reactionSuccess, key: m.key } });

  } catch (error) {
    console.error('Error al descargar Xvideos:', error);
    // Reacción de error
    await conn.sendMessage(m.chat, { react: { text: reactionError, key: m.key } });
    throw `${ERROR_MESSAGE}\n${EXAMPLE_URL}`;
  }
};

// Se cambió handler.tags a minúsculas
handler.tags = ['nsfw']; 
// Se cambió handler.help a minúsculas
handler.help = ['xvideosdl']; 
// Se cambió handler.command a minúsculas
handler.command = /^(xvideosdl)$/i; 
export default handler;

// --- Funciones auxiliares (Sin cambios en la lógica de scraping) ---

async function xvideosdl(url) {
  return new Promise((resolve, reject) => {
    fetch(`${url}`, { method: 'get' })
      .then(res => res.text())
      .then(res => {
        let $ = cheerio.load(res, { xmlMode: false });
        // Se cambiaron las variables internas a snake_case o camelCase estándar
        const title = $("meta[property='og:title']").attr("content");
        const keyword = $("meta[name='keywords']").attr("content");
        const views = $("div#video-tabs > div > div > div > div > strong.mobile-hide").text() + " views";
        const vote = $("div.rate-infos > span.rating-total-txt").text();
        const likes = $("span.rating-good-nbr").text();
        const deslikes = $("span.rating-bad-nbr").text();
        const thumb = $("meta[property='og:image']").attr("content");
        const videoUrl = $("#html5video > #html5video_base > div > a").attr("href"); // Renombrada de 'url' a 'videoUrl'

        // Se usa 'videoUrl' en el resultado
        resolve({ status: 200, result: { title, url: videoUrl, keyword, views, vote, likes, deslikes, thumb } });
      })
      .catch(reject); // Asegurar que el error de fetch se maneje
  });
}

// xvideosSearch se mantiene sin cambios ya que no es usada en el handler principal
async function xvideosSearch(url) {
  return new Promise(async (resolve) => {
    await axios.request(`https://www.xvideos.com/?k=${url}&p=${Math.floor(Math.random() * 9) + 1}`, { method: "get" }).then(async result => {
      let $ = cheerio.load(result.data, { xmlMod3: false });
      let title = [];
      let duration = [];
      let quality = [];
      let videoUrl = []; // Cambiado a videoUrl para consistencia
      let thumb = [];
      let hasil = [];

      $("div.mozaique > div > div.thumb-under > p.title").each(function (a, b) {
        title.push($(this).find("a").attr("title"));
        duration.push($(this).find("span.duration").text());
        videoUrl.push("https://www.xvideos.com" + $(this).find("a").attr("href"));
      });
      $("div.mozaique > div > div.thumb-under").each(function (a, b) {
        quality.push($(this).find("span.video-hd-mark").text());
      });
      $("div.mozaique > div > div > div.thumb > a").each(function (a, b) {
        thumb.push($(this).find("img").attr("data-src"));
      });
      for (let i = 0; i < title.length; i++) {
        hasil.push({
          title: title[i],
          duration: duration[i],
          quality: quality[i],
          thumb: thumb[i],
          url: videoUrl[i]
        });
      }
      resolve(hasil);
    });
  });
};