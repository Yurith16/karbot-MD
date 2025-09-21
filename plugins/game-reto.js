/* Desarrollado y Creado por: HERNANDEZ - KARBOT-MD */

const handler = async (m, {conn}) => {
  const retos = [
    "💪 Haz 10 flexiones ahora mismo",
    "🎤 Canta una canción en voz alta", 
    "💬 Di algo vergonzoso de ti",
    "🤣 Cuenta un chiste malo",
    "📸 Tómate una selfie divertida",
    "💃 Baila por 30 segundos",
    "🗣️ Imita a alguien del grupo",
    "🎭 Haz una mueca graciosa",
    "📝 Escribe un poema improvisado",
    "🎮 Nombra 5 videojuegos en 10 segundos",
    "🍔 Di tu comida favorita con acento extranjero",
    "🤔 Responde una pregunta personal",
    "🎵 Tararea una canción para que adivinen",
    "📅 Di qué harías si fuera el último día en la Tierra",
    "👻 Cuenta una historia de miedo en 3 oraciones"
  ];

  conn.reply(m.chat, `╔══════════════════╗\n         🔥 *RETO* 🔥\n╚══════════════════╝\n\n*“${pickRandom(retos)}”*\n\n╔══════════════════╗\n         🤖 *KARBOT-MD* 🤖\n╚══════════════════╝`, m);
};

handler.help = ['reto'];
handler.tags = ['game'];
handler.command = /^reto|challenge|desafio$/i;
export default handler;

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())];
}


