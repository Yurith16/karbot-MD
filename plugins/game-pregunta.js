/* Desarrollado y Creado por: HERNANDEZ - KARBOT-MD */

const handler = async (m, { command, text }) => {
  const respuestas = [
    "✨ Sí, definitivamente",
    "✅ Es cierto",
    "👍 Sin duda",
    "🔮 Es seguro que sí",
    "💫 Muy probable",
    "❌ No, definitivamente no", 
    "👎 Muy dudoso",
    "🌪️ No cuentes con ello",
    "🔍 Mejor no te lo digo ahora",
    "⚡ Pregunta de nuevo más tarde",
    "💭 Concéntrate y pregunta otra vez",
    "🎯 Las señales apuntan a que sí"
  ];

  m.reply(`
🎯 *RESPUESTA DEL DESTINO* 🎯

*Pregunta:* ${text}
*Respuesta:* ${respuestas.getRandom()}
`.trim(), null, await m.mentionedJid ? {
    mentions: await m.mentionedJid,
  } : {});

}

handler.help = ['pregunta <texto>?'];
handler.tags = ['game'];
handler.command = /^pregunta|preguntas|apakah$/i;
export default handler;
