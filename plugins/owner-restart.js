const handler = async (m, { conn }) => {
  if (!process.send) {
    // Reacción de error
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      });
    } catch (reactError) {}

    throw `┌──「 ❌ NO SOPORTADO 」
│
│ El reinicio automático no está
│ disponible en este entorno.
│ 
│ 🔧 Reinicia el bot manualmente
│ desde el panel de control.
└──────────────`;
  }

  // Reacción de reinicio
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '🔄',
        key: m.key
      }
    });
  } catch (reactError) {}

  await m.reply(`┌──「 🔄 REINICIANDO BOT 」
│
│ 🤖 El bot se está reiniciando...
│ 
│ ⏳ Esto tomará unos segundos
│ 📱 Reconectando servicios
│ 🔧 Actualizando procesos
│ 
│ ✅ Volverá en línea automáticamente
└──────────────`);

  // Enviar señal de reinicio
  process.send('reset');
};

handler.help = ['restart'];
handler.tags = ['owner'];
handler.command = /^(restart|reiniciar|reboot|reinicio)$/i;
handler.rowner = true;

export default handler;