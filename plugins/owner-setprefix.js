const handler = async (m, {conn, text, usedPrefix, command}) => {
  if (!text) {
    // Reacción de error
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      });
    } catch (reactError) {}

    throw `┌──「 ❌ FALTA EL PREFIJO 」
│
│ Debes especificar un nuevo prefijo.
│ 
│ 💡 Ejemplo:
│ ➺ ${usedPrefix + command} /
│ ➺ ${usedPrefix + command} !
│ ➺ ${usedPrefix + command} $
│ 
│ ⚠️ Solo para propietarios
└──────────────`;
  }

  // Validar que el prefijo no sea muy largo
  if (text.length > 3) {
    // Reacción de error
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      });
    } catch (reactError) {}

    throw `┌──「 ❌ PREFIJO DEMASIADO LARGO 」
│
│ El prefijo no puede tener más de 3 caracteres.
│ 
│ 📏 Longitud actual: ${text.length}
│ 💡 Prefijo sugerido: ${text.slice(0, 3)}
│ 
│ 🔧 Intenta con un prefijo más corto
└──────────────`;
  }

  global.prefix = new RegExp('^[' + (text || global.opts['prefix'] || '‎xzXZ/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']');

  // Reacción de éxito
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '✅',
        key: m.key
      }
    });
  } catch (reactError) {}

  await m.reply(`┌──「 ✅ PREFIJO ACTUALIZADO 」
│
│ 🔧 *Nuevo prefijo:* ${text}
│ 
│ 💡 Ahora usa los comandos así:
│ ➺ ${text}menu
│ ➺ ${text}help
│ ➺ ${text}ping
│ 
│ ⚙️ Cambio aplicado globalmente
└──────────────`);
};

handler.help = ['setprefix'];
handler.tags = ['owner'];
handler.command = /^(setprefix|cambiarprefijo|prefijo)$/i;
handler.rowner = true;

export default handler;