/* Desarrollado y Creado por: HERNANDEZ - KARBOT-MD */

import yts from 'yt-search';
import fs from 'fs';

const handler = async (m, {conn, text, usedPrefix, command}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.downloader_playlist

  if (!text) throw `🎵 *INGRESE EL NOMBRE DE LA PLAYLIST*\n*Ejemplo:* ${usedPrefix + command} Beggin you`;
  
  try {
    const vids_ = {
      from: m.sender,
      urls: [],
    };
    
    if (!global.videoList) {
      global.videoList = [];
    }
    
    if (global.videoList[0]?.from == m.sender) {
      global.videoList.splice(0, global.videoList.length);
    }
    
    const results = await yts(text);
    
    const textoInfo = `📋 *OPCIONES DE DESCARGA*\n
🔹 ${usedPrefix}audio <numero>
🔹 ${usedPrefix}video <numero>

💡 *Ejemplos:*
🔸 *${usedPrefix}audio 5*
🔸 *${usedPrefix}video 8*`.trim();

    const teks = results.all.map((v, i) => {
      const link = v.url;
      vids_.urls.push(link);
      return `[${i + 1}] ${v.title}
↳ 🔗 *Enlace:* ${v.url}
↳ ⏱️ *Duración:* ${v.timestamp}
↳ 📅 *Publicado:* ${v.ago}
↳ 👀 *Vistas:* ${v.views}`;
    }).join('\n\n┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅\n\n');

    conn.sendFile(m.chat, results.all[0].thumbnail, 'karbot-playlist.jpeg', textoInfo + '\n\n' + teks, m);
    global.videoList.push(vids_);
    
  } catch {
    await m.reply(`❌ *ERROR AL BUSCAR LA PLAYLIST*`);
  }
};

handler.help = ['playlist *<texto>*'];
handler.tags = ['search'];
handler.command = /^playlist|playlist2$/i;
export default handler;