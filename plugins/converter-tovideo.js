/* Desarrollado y Creado por: HERNANDEZ - KARBOT-MD */

import {webp2mp4} from '../src/libraries/webp2mp4.js';
import {ffmpeg} from '../src/libraries/converter.js';

const handler = async (m, {conn, usedPrefix, command}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.convertidor_tovideo

  if (!m.quoted) throw `🎬 *RESPONDA A UN STICKER ANIMADO PARA CONVERTIR A VIDEO*`;
  const mime = m.quoted.mimetype || '';
  if (!/webp/.test(mime)) throw `❌ *EL ARCHIVO DEBE SER UN STICKER ANIMADO*`;
  const media = await m.quoted.download();
  let out = Buffer.alloc(0);
  if (/webp/.test(mime)) {
    out = await webp2mp4(media);
  } else if (/audio/.test(mime)) {
    out = await ffmpeg(media, [
        '-filter_complex', 'color',
        '-pix_fmt', 'yuv420p',
        '-crf', '51',
        '-c:a', 'copy',
        '-shortest',
      ], 'mp3', 'mp4');
  }
  await conn.sendFile(m.chat, out, 'karbot-video.mp4', '✅ *CONVERSIÓN EXITOSA*', m, 0, {thumbnail: out});
};

handler.help = ['tomp4'];
handler.tags = ['converter'];
handler.command = ['tovideo', 'tomp4', 'mp4', 'togif'];

export default handler;