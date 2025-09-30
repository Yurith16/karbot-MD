const handler = async (m, {conn, text}) => {
  // Sistema de reacción - indicar procesamiento
  await conn.sendMessage(m.chat, { react: { text: '💖', key: m.key } });

  const piropos = [
    "*Eres como el código perfecto: sin errores y siempre funcionas en mi corazón.* 💻❤️",
    "*Si fueras una variable, serías 'const' porque nunca cambias de hermosa.* ⚡",
    "*Eres más eficiente que el algoritmo más optimizado.* 🚀",
    "*Mi corazón hace un bucle infinito cada vez que te veo.* 🔄💘",
    "*Eres la excepción que siempre quiero capturar.* 💫",
    "*Como un commit perfecto, cada día contigo es una mejora.* 🌟",
    "*Si el amor fuera código, tú serías mi función principal.* 💞",
    "*Eres más rara que un bug que no se puede reproducir.* 🐞💕",
    "*Mi amor por ti es como un servidor: siempre en línea.* 🌐❤️",
    "*Eres el CSS de mi HTML, le das estilo a mi vida.* 🎨",
    "*Como un array ordenado, todo encaja perfectamente contigo.* 📊",
    "*Eres mi API favorita, siempre devuelves la respuesta correcta.* 🔗",
    "*Si fueras un lenguaje de programación, serías Python: elegante y poderoso.* 🐍💖",
    "*Mi corazón compila sin errores cuando pienso en ti.* ⚙️💓",
    "*Eres el firewall de mi vida, proteges mi corazón.* 🛡️❤️",
    "*Como un git pull, siempre traes lo mejor de ti.* 📥🌟",
    "*Eres más dulce que un comentario bien escrito en el código.* 💬🍯",
    "*Mi amor por ti es como JavaScript: en todas partes.* 🌍💛",
    "*Eres la query perfecta que siempre encuentra lo que busco en la vida.* 🔍💖",
    "*Si fueras un framework, serías React: haces que todo sea reactivo.* ⚛️💫",
    "*Eres el debugger de mi alma, encuentras y arreglas todo.* 🐛🔧",
    "*Mi cariño por ti es como un servidor cloud: siempre disponible.* ☁️❤️",
    "*Eres más especial que una variable global bien usada.* 🌐💕",
    "*Como una base de datos, guardas todos mis mejores recuerdos.* 💾🌟",
    "*Eres el SSL de mi corazón, nuestra conexión es segura.* 🔒💖",
    "*Si el amor tuviera versión, contigo sería la 2.0.* 🆙💘",
    "*Eres más necesaria que el punto y coma en JavaScript.* 💛",
    "*Mi amor por ti es como un loop while: nunca termina.* 🔄❤️",
    "*Eres la excepción que quiero en mi bloque try-catch.* 🎯💕",
    "*Como un buen algoritmo, contigo todo tiene solución óptima.* 📈🌟"
  ];

  const piropoSeleccionado = pickRandom(piropos);

  await m.reply(`*💝 PIROPO TECNOLÓGICO 💝*\n\n${piropoSeleccionado}\n\n*¡Eres especial!* ✨`);
};

handler.help = ['piropo'];
handler.tags = ['tools'];
handler.command = ['piropo', 'cumplido', 'tecnoamor'];
export default handler;

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())];
}