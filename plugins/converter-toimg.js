/* Desarrollado y Creado por: HERNANDEZ - KARBOT-MD */

import {webp2png} from '../src/libraries/webp2mp4.js';

const handler = async (m, {conn, usedPrefix, command}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.convertidor_toimg

  const notStickerMessage = `🖼️ *RESPONDA A UN STICKER PARA CONVERTIR A IMAGEN*`;
  if (!m.quoted) throw notStickerMessage;
  const q = m.quoted || m;
  const mime = q.mediaType || '';
  if (!/sticker/.test(mime)) throw notStickerMessage;
  const media = await q.download();
  const out = await webp2png(media).catch((_) => null) || Buffer.alloc(0);
  await conn.sendFile(m.chat, out, 'karbot-image.png', null, m);
};

handler.help = ['toimg'];
handler.tags = ['converter'];
handler.command = ['toimg', 'jpg', 'img'];

export default handler;