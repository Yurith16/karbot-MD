import { readdirSync, unlinkSync, existsSync, promises as fs, rmSync, readFileSync } from 'fs';
import path from 'path';

const handler = async (m, { conn, usedPrefix }) => {
  if (global.conn.user.jid !== conn.user.jid) {
    return await conn.sendMessage(m.chat, {
      text: `*「❌」 Comando Principal*\n\n> ✦ *Solo funciona con el bot principal*`
    }, { quoted: m });
  }

  const chatId = m.isGroup ? [m.chat, m.sender] : [m.sender];
  const sessionPath = './KarbotSession/';

  try {
    const files = await fs.readdir(sessionPath);
    let filesDeleted = 0;

    for (const file of files) {
      for (const id of chatId) {
        if (file.includes(id.split('@')[0])) {
          await fs.unlink(path.join(sessionPath, file));
          filesDeleted++;
          break;
        }
      }
    }

    if (filesDeleted === 0) {
      await conn.sendMessage(m.chat, {
        text: `*「✅» Sesión Limpia*\n\n> ✦ *No se encontraron archivos pendientes*`
      }, { quoted: m });
    } else {
      await conn.sendMessage(m.chat, {
        text: `*「🗑️» Archivos Eliminados*\n\n> ✦ *Archivos eliminados:* » ${filesDeleted}\n> ✦ *Estado:* » Sesión limpiada`
      }, { quoted: m });
    }

  } catch (err) {
    console.error('Error al limpiar sesiones:', err);
    await conn.sendMessage(m.chat, {
      text: `*「❌» Error de Limpieza*\n\n> ✦ *Error:* » ${err.message}`
    }, { quoted: m });
  }
};

handler.help = ['ds'];
handler.tags = ['group'];
handler.command = /^(fixmsgespera|ds|fixsession|limpiarsesion)$/i;

export default handler;