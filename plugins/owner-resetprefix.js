const handler = async (m, {conn}) => {
  // Restablecer el prefijo al valor por defecto
  const defaultPrefix = '.';
  global.prefix = new RegExp('^[' + (defaultPrefix).replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']');

  // Reacción de éxito
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '✅',
        key: m.key
      }
    });
  } catch (reactError) {}

  await m.reply(`┌──「 ✅ PREFIJO RESTABLECIDO 」
│
│ 🔧 *Prefijo actual:* ${defaultPrefix}
│ 
│ 💡 Ahora usa los comandos así:
│ ➺ ${defaultPrefix}menu
│ ➺ ${defaultPrefix}help  
│ ➺ ${defaultPrefix}ping
│ 
│ ⚙️ Prefijo restablecido al valor
│ por defecto del bot
└──────────────`);
};

handler.help = ['resetprefix'];
handler.tags = ['owner'];
handler.command = /^(resetprefix|restablecerprefijo|prefijodefecto)$/i;
handler.rowner = true;

export default handler;