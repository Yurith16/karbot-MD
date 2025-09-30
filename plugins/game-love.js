import fs from 'fs';

const handler = async (m, { conn, command, text }) => {
  if (!text) return m.reply('¡Tienes que mencionar a alguien o escribir un nombre!');

  const lovePercentage = Math.floor(Math.random() * 100);
  const isHighLove = lovePercentage >= 50;

  const loveMessages = [
    'El destino los ha unido, ¡su amor es una historia que vale la pena contar!',
    'Una conexión inquebrantable, ¡son almas gemelas!',
    'El amor es un juego y ustedes ganaron, ¡su compatibilidad es asombrosa!',
    'El futuro les sonríe, ¡su amor es una obra de arte!',
    'Una química perfecta, ¡crean un universo propio!',
    'El amor verdadero no tiene fecha de caducidad, ¡felicidades por su conexión!',
  ];

  const notSoHighLoveMessages = [
    'Aún hay un camino por recorrer, ¡pero cada gran amor tiene su inicio!',
    'El amor es como una planta, hay que regarlo, ¡no se rindan!',
    'No todo es un cuento de hadas, pero con esfuerzo, ¡pueden escribir su propia historia!',
    'Una chispa es suficiente para encender un gran fuego, ¡no pierdan la esperanza!',
    'El amor puede ser un desafío, ¡pero los desafíos los hacen más fuertes!',
  ];

  const getRandomMessage = (messages) => messages[Math.floor(Math.random() * messages.length)];
  const loveMessage = isHighLove ? getRandomMessage(loveMessages) : getRandomMessage(notSoHighLoveMessages);

  const response =
    `*━━━━━━━⬣ 💕 KARBOT-MD 💕 ⬣━━━━━━━*\n` +
    `\n*🥰 ¡Cálculo de amor! 🥰*\n` +
    `*👩‍❤️‍💋‍👨 El amor entre ${text} y @${m.sender.split('@')[0]} es de:* *${lovePercentage}%*\n\n` +
    `*✍️ Mensaje de amor:* ${loveMessage}\n` +
    `\n*━━━━━━━⬣ 💕 KARBOT-MD 💕 ⬣━━━━━━━*`;

  async function loading() {
    const hawemod = [
      "《 █▒▒▒▒▒▒▒▒▒▒▒》10%",
      "《 ████▒▒▒▒▒▒▒▒》30%",
      "《 ███████▒▒▒▒▒》50%",
      "《 ██████████▒▒》80%",
      "《 ████████████》100%"
    ];
    let { key } = await conn.sendMessage(m.chat, { text: '✨ Calculando... ✨', mentions: conn.parseMention(response) }, { quoted: m });
    for (let i = 0; i < hawemod.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await conn.sendMessage(m.chat, { text: hawemod[i], edit: key, mentions: conn.parseMention(response) }, { quoted: m });
    }
    await conn.sendMessage(m.chat, { text: response, edit: key, mentions: conn.parseMention(response) }, { quoted: m });
  }

  loading();
};

handler.help = ['love'];
handler.tags = ['game'];
handler.command = /^(love|amor)$/i;

export default handler;