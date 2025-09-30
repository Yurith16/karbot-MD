/* Desarrollado y Creado por: HERNANDEZ - KARBOT-MD */

import {toPTT} from '../src/libraries/converter.js';

const handler = async (m, {conn, usedPrefix, command}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.convertidor_toptt
  
  const q = m.quoted ? m.quoted : m;
  const mime = (m.quoted ? m.quoted : m.msg).mimetype || '';
  if (!/video|audio/.test(mime)) throw `🎙️ *RESPONDA A UN VIDEO O AUDIO PARA CONVERTIR A NOTA DE VOZ*`;
  const media = await q.download?.();
  if (!media && !/video/.test(mime)) throw `❌ *ERROR AL DESCARGAR EL ARCHIVO DE VIDEO*`;
  if (!media && !/audio/.test(mime)) throw `❌ *ERROR AL DESCARGAR EL ARCHIVO DE AUDIO*`;
  const audio = await toPTT(media, 'mp4');
  if (!audio.data && !/audio/.test(mime)) throw `❌ *ERROR AL CONVERTIR AUDIO A NOTA DE VOZ*`;
  if (!audio.data && !/video/.test(mime)) throw `❌ *ERROR AL CONVERTIR VIDEO A NOTA DE VOZ*`;
  const aa = conn.sendFile(m.chat, audio.data, 'karbot-audio.mp3', '', m, true, { mimetype: 'audio/mpeg' });
  if (!aa) return conn.sendMessage(m.chat, { audio: { url: media }, fileName: 'karbot-audio.mp3', mimetype: 'audio/mpeg', ptt: true }, { quoted: m });
};

handler.help = ['tovn'];
handler.tags = ['converter'];
handler.command = ['tovn', 'toptt'];

export default handler;