/* Desarrollado y Creado por: HERNANDEZ - KARBOT-MD */

import {toAudio} from '../src/libraries/converter.js';

const handler = async (m, {conn, usedPrefix, command}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.convertidor_tomp3

  const q = m.quoted ? m.quoted : m;
  const mime = (q || q.msg).mimetype || q.mediaType || '';
  if (!/video|audio/.test(mime)) throw `🎵 *RESPONDA A UN VIDEO O AUDIO PARA CONVERTIR A MP3*`;
  const media = await q.download();
  if (!media) throw `❌ *ERROR AL DESCARGAR EL ARCHIVO MULTIMEDIA*`;
  const audio = await toAudio(media, 'mp4');
  if (!audio.data) throw `❌ *ERROR AL CONVERTIR EL ARCHIVO A AUDIO*`;
  conn.sendMessage(m.chat, { audio: audio.data, mimetype: 'audio/mpeg' }, { quoted: m });
};

handler.help = ['tomp3'];
handler.tags = ['converter'];
handler.command = ['tomp3', 'toaudio'];

export default handler;