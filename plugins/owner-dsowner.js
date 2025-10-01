import { readdirSync, unlinkSync, existsSync, promises as fs, rmSync, readFileSync } from 'fs';
import path from 'path';

const handler = async (m, { conn, usedPrefix }) => {
  if (global.conn.user.jid !== conn.user.jid) {
    // Reacción de error
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      });
    } catch (reactError) {}

    return conn.sendMessage(m.chat, {
      text: '❌ *COMANDO NO DISPONIBLE*\n\nEste comando solo puede ser usado desde la cuenta principal del bot.'
    }, {quoted: m});
  }

  // Reacción de proceso
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '🔄',
        key: m.key
      }
    });
  } catch (reactError) {}

  await conn.sendMessage(m.chat, {
    text: '🔄 *INICIANDO LIMPIEZA DE SESIÓN*\n\nEliminando archivos temporales de la sesión...'
  }, {quoted: m});

  const sessionPath = './KarbotSession/';

  try {
    if (!existsSync(sessionPath)) {
      // Reacción de error
      try {
        await conn.sendMessage(m.chat, {
          react: {
            text: '❌',
            key: m.key
          }
        });
      } catch (reactError) {}

      return await conn.sendMessage(m.chat, {
        text: '❌ *CARPETA NO ENCONTRADA*\n\nLa carpeta KarbotSession no existe.'
      }, {quoted: m});
    }

    const files = await fs.readdir(sessionPath);
    let filesDeleted = 0;

    for (const file of files) {
      if (file !== 'creds.json') {
        await fs.unlink(path.join(sessionPath, file));
        filesDeleted++;
      }
    }

    if (filesDeleted === 0) {
      // Reacción de información
      try {
        await conn.sendMessage(m.chat, {
          react: {
            text: 'ℹ️',
            key: m.key
          }
        });
      } catch (reactError) {}

      await conn.sendMessage(m.chat, {
        text: 'ℹ️ *SESIÓN YA ESTÁ LIMPIA*\n\nNo se encontraron archivos para eliminar.'
      }, {quoted: m});
    } else {
      // Reacción de éxito
      try {
        await conn.sendMessage(m.chat, {
          react: {
            text: '✅',
            key: m.key
          }
        });
      } catch (reactError) {}

      await conn.sendMessage(m.chat, {
        text: `✅ *LIMPIEZA COMPLETADA*\n\nSe eliminaron ${filesDeleted} archivos de sesión.\n\nLa carpeta KarbotSession ha sido limpiada correctamente.`
      }, {quoted: m});
    }
  } catch (err) {
    console.error('Error al limpiar la sesión:', err);

    // Reacción de error
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      });
    } catch (reactError) {}

    await conn.sendMessage(m.chat, {
      text: '❌ *ERROR EN LA LIMPIEZA*\n\nNo se pudo completar la limpieza de la sesión.'
    }, {quoted: m});
  }

  await conn.sendMessage(m.chat, {
    text: `📱 *REINICIA LA CONEXIÓN*\n\nUsa el comando 3 veces seguidas:\n${usedPrefix}s\n${usedPrefix}s\n${usedPrefix}s\n\nPara aplicar los cambios correctamente.`
  }, {quoted: m});
};

handler.help = ['del_reg_in_session_owner'];
handler.tags = ['owner'];
handler.command = /^(del_reg_in_session_owner|dsowner|clearallsession|limpiarsesion|clearsession)$/i;
handler.rowner = true;

export default handler;