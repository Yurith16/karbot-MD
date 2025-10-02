import { readdirSync, statSync, unlinkSync, existsSync, readFileSync, watch, rmSync, promises as fsPromises } from 'fs';
import path, { join } from 'path';

const handler = async (m, { conn: _conn }) => {
  const conn = _conn;

  // Obtener el remitente del mensaje
  const sender = m.mentionedJid && m.mentionedJid[0] ? 
    m.mentionedJid[0] : 
    m.fromMe ? conn.user.jid : m.sender;

  const userCode = sender.split('@')[0];

  // Verificar si es el bot principal
  if (global.conn.user.jid !== conn.user.jid) {
    return conn.reply(m.chat, {
      'text': '*[❗] Use este comando directamente en el numero del Bot principal*'
    }, { 'quoted': m });
  } else {
    await conn.sendMessage(m.chat, {
      'text': '*[❗] Adiós Bot, haz dejado de ser un Bot*'
    }, { 'quoted': m });
  }

  try {
    // Eliminar directorio del sub-bot
    const userDir = './jadibts/' + userCode;
    await fsPromises.rmdir(userDir, {
      'recursive': true,
      'force': true
    });

    await conn.reply(m.chat, {
      'text': '*[❗] Todos los archivos de session fueron eliminados*'
    }, { 'quoted': m });

  } catch (error) {
    console.error('error', error);
  }
};

// Configuración del comando
handler.help = ['deletebot'];
handler.tags = ['jadibot'];
handler.command = /^(deletebot|aa2)$/i;
handler.private = true;
handler.fail = null;

export default handler;