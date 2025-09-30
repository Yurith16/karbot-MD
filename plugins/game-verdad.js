const handler = async (m, {conn}) => {
  const verdades = [
    "💬 ¿Cuál es tu mayor miedo?",
    "🤫 ¿Qué es lo más vergonzoso que has hecho?",
    "💕 ¿Te has enamorado de alguien del grupo?",
    "😳 ¿Alguna vez has sido arrestado?",
    "🤔 ¿Qué es lo más raro que has comido?",
    "🎭 ¿Has fingido ser alguien más en internet?",
    "💸 ¿Cuánto dinero gastas en tus vicios?",
    "📱 ¿Revisas el teléfono de tu pareja?",
    "🚫 ¿Qué hábito malo no puedes dejar?",
    "🎮 ¿Videojuego que más horas te ha quitado?",
    "📺 ¿Serie que viste completa en un día?",
    "🍕 ¿Comida que podrías comer todos los días?",
    "🤥 ¿Mentira que siempre dices?",
    "💔 ¿Peor ruptura que has tenido?",
    "🎉 ¿Fiesta más loca a la que has ido?",
    "🌎 ¿Lugar más exótico que has visitado?",
    "😅 ¿Situación más incómoda que viviste?",
    "💰 ¿Qué harías si ganas la lotería?",
    "🌟 ¿Tu mayor talento secreto?",
    "🔞 ¿Contenido adulto que consumes?"
  ];

  conn.reply(m.chat, 
    `╔══════════════════╗\n` +
    `         💬 *VERDAD* 💬\n` +
    `╚══════════════════╝\n\n` +
    `*"${pickRandom(verdades)}"*\n\n` +
    `╔══════════════════╗\n` +
    `         🤖 *KARBOT-MD* 🤖\n` +
    `╚══════════════════╝`, 
  m);
};

handler.help = ['verdad'];
handler.tags = ['game'];
handler.command = /^verdad|true|pregunta$/i;
export default handler;

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())];
}


