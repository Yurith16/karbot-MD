/* Desarrollado y Creado por: HERNANDEZ - KARBOT-MD */

import * as googleTTS from '@sefinek/google-tts-api'
import {readFileSync, unlinkSync} from 'fs';
import {join} from 'path';
const defaultLang = 'es';

const handler = async (m, {conn, args, usedPrefix, command}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.convertidor_tts

  let lang = args[0];
  let text = args.slice(1).join(' ');
  if ((args[0] || '').length !== 2) {
    lang = defaultLang;
    text = args.join(' ');
  }
  if (!text && m.quoted?.text) text = m.quoted.text;
  
  if (!text) throw `🗣️ *INGRESE EL TEXTO QUE DESEA CONVERTIR A AUDIO*\n*EJEMPLO:* ${usedPrefix + command} es Hola mundo`;
  
  let res;
  try {
    res = googleTTS.getAudioUrl(text, { 
      lang: lang || 'es', 
      slow: false, 
      host: 'https://translate.google.com' 
    });
  } catch (e) {
    m.reply(`❌ *ERROR AL GENERAR AUDIO: ${e}*`);
    text = args.join(' ');
    if (!text) throw `🗣️ *INGRESE EL TEXTO QUE DESEA CONVERTIR A AUDIO*`;
    res = await tts(text, defaultLang);
  } finally {
    if (res) {
      conn.sendPresenceUpdate('recording', m.chat);
      // Enviar como audio normal en lugar de nota de voz para mejor compatibilidad
      conn.sendMessage(m.chat, { 
        audio: { url: res }, 
        fileName: 'karbot-tts.mp3', 
        mimetype: 'audio/mpeg',
        ptt: false // Cambiado a false para mejor reproducción
      }, { quoted: m });
    }
  }
};

handler.help = ['tts'];
handler.tags = ['converter'];
handler.command = ['tts'];

export default handler;

function tts(text, lang = 'es') {
  return new Promise((resolve, reject) => {
    try {
      const tts = gtts(lang);
      const filePath = join(global.__dirname(import.meta.url), '../src/tmp', (1 * new Date) + '.wav');
      tts.save(filePath, text, () => {
        resolve(readFileSync(filePath));
        unlinkSync(filePath);
      });
    } catch (e) {
      reject(e);
    }
  });
}