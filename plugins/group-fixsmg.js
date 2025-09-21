/* Codigo hecho por @Fabri115 y mejorado por BrunoSobrino */

import { readdirSync, unlinkSync, existsSync, promises as fs, rmSync, readFileSync } from 'fs';
import path from 'path';

const handler = async (m, { conn, usedPrefix }) => {
  if (global.conn.user.jid !== conn.user.jid) {
    return conn.sendMessage(m.chat, {
      text: `❌ *ESTE COMANDO SOLO FUNCIONA CON EL BOT PRINCIPAL*`
    }, {quoted: m});
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
        text: `✅ *NO SE ENCONTRARON ARCHIVOS DE SESIÓN*\n\nNo había archivos pendientes para eliminar`
      }, {quoted: m});
    } else {
      await conn.sendMessage(m.chat, {
        text: `✅ *ARCHIVOS ELIMINADOS*\n\nSe eliminaron ${filesDeleted} archivos de sesión pendientes`
      }, {quoted: m});
    }

  } catch (err) {
    console.error('Error al limpiar sesiones:', err);
    await conn.sendMessage(m.chat, {
      text: `❌ *ERROR AL LIMPIAR SESIONES*\n\nNo se pudieron eliminar los archivos: ${err.message}`
    }, {quoted: m});
  }

  // Instrucciones para reiniciar
  await conn.sendMessage(m.chat, {
    text: `🔄 *REINICIA EL BOT PARA APLICAR CAMBIOS*\n\nEscribe el comando:\n${usedPrefix}s\n${usedPrefix}s\n${usedPrefix}s\n\n✨ *KARBOT-MD*`
  }, {quoted: m});
};

handler.help = ['ds'];
handler.tags = ['group'];
handler.command = /^(fixmsgespera|ds|fixsession|limpiarsesion)$/i;

export default handler;
