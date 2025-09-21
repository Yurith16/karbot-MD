/* Creador: HERNANDEZ */

import fs from 'fs';
import fetch from 'node-fetch';

const handler = async (m, { conn, usedPrefix }) => {
  const pp = 'https://qu.ax/yZlYi.png';

  const str = `╭─「 🗳️ *CAJA FUERTE KARBOT-MD* 🗳️ 」
│
│ ¡Hola, @${m.sender.split('@')[0]}! 👋
│ Aquí puedes guardar y gestionar
│ tus archivos y mensajes de forma
│ privada dentro del bot.
│
│ *⭐ COMANDOS PARA AGREGAR*
│
│ ඬ⃟🗳️ *${usedPrefix}agregarmsg* (responde a un mensaje)
│ ඬ⃟🗳️ *${usedPrefix}agregarvn* (responde a un audio)
│ ඬ⃟🗳️ *${usedPrefix}agregarvideo* (responde a un video)
│ ඬ⃟🗳️ *${usedPrefix}agregaraudio* (responde a un audio)
│ ඬ⃟🗳️ *${usedPrefix}agregarimg* (responde a una imagen)
│ ඬ⃟🗳️ *${usedPrefix}agregarsticker* (responde a un sticker)
│
│ *⭐ COMANDOS PARA VER LA LISTA*
│
│ ඬ⃟🗳️ *${usedPrefix}listamsg*
│ ඬ⃟🗳️ *${usedPrefix}listavn*
│ ඬ⃟🗳️ *${usedPrefix}listavideo*
│ ඬ⃟🗳️ *${usedPrefix}listaaudio*
│ ඬ⃟🗳️ *${usedPrefix}listaimg*
│ ඬ⃟🗳️ *${usedPrefix}listasticker*
│
│ *⭐ COMANDOS PARA VER ARCHIVOS*
│
│ ඬ⃟🗳️ *${usedPrefix}vermsg* (nombre)
│ ඬ⃟🗳️ *${usedPrefix}vervn* (nombre)
│ ඬ⃟🗳️ *${usedPrefix}vervideo* (nombre)
│ ඬ⃟🗳️ *${usedPrefix}veraudio* (nombre)
│ ඬ⃟🗳️ *${usedPrefix}verimg* (nombre)
│ ඬ⃟🗳️ *${usedPrefix}versticker* (nombre)
│
│ *⭐ COMANDOS PARA ELIMINAR*
│
│ ඬ⃟🗳️ *${usedPrefix}eliminarmsg* (nombre)
│ ඬ⃟🗳️ *${usedPrefix}eliminarvn* (nombre)
│ ඬ⃟🗳️ *${usedPrefix}eliminarvideo* (nombre)
│ ඬ⃟🗳️ *${usedPrefix}eliminaraudio* (nombre)
│ ඬ⃟🗳️ *${usedPrefix}eliminarimg* (nombre)
│ ඬ⃟🗳️ *${usedPrefix}eliminarsticker* (nombre)
│
╰─「 *KARBOT-MD - Proyecto Privado* 」`.trim();

  try {
    const contextInfo = {
      mentionedJid: [m.sender],
      externalAdReply: {
        title: '🔒 CAJA FUERTE KARBOT-MD 🔒',
        body: 'Almacenamiento privado de archivos',
        thumbnailUrl: pp,
        mediaType: 1,
        sourceUrl: ' '
      }
    };

    if (m.isGroup) {
      conn.sendMessage(m.chat, { image: { url: pp }, caption: str, contextInfo }, { quoted: m });
    } else {
      const fkontak2 = { 'key': { 'participants': '0@s.whatsapp.net', 'remoteJid': 'status@broadcast', 'fromMe': false, 'id': 'Halo' }, 'message': { 'contactMessage': { 'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` } }, 'participant': '0@s.whatsapp.net' };
      conn.sendMessage(m.chat, { image: { url: pp }, caption: str, contextInfo }, { quoted: fkontak2 });
    }
  } catch (e) {
    console.error('Error en el handler de caja fuerte:', e);
    const fallbackText = `*❌ Ocurrió un error. Inténtalo de nuevo más tarde.*`;
    m.reply(fallbackText);
  }
};

handler.help = ['cajafuerte'];
handler.tags = ['owner'];
handler.command = /^(cajafuerte|safebox)$/i;
handler.rowner = true;

export default handler;