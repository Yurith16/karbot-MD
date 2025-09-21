/* Desarrollado y Creado por: HERNANDEZ - KARBOT-MD */

const handler = async (m, { conn, command, text, usedPrefix }) => {
  if (!text) throw `🎯 *INGRESA UN NOMBRE O ETIQUETA*\n*Ejemplo:* ${usedPrefix + command} @usuario`;

  const percentages = (500).getRandom();
  let emoji = '';
  let description = '';

  switch (command) {
    case 'gay2':
      emoji = '🏳️‍🌈';
      if (percentages < 50) {
        description = `🔹 *${text.toUpperCase()} ES ${percentages}% GAY* ${emoji}\n*Resultado bajo, casi normal*`;
      } else if (percentages > 100) {
        description = `🔥 *${text.toUpperCase()} ES ${percentages}% GAY* ${emoji}\n*¡Nivel máximo de homosexualidad!*`;
      } else {
        description = `✨ *${text.toUpperCase()} ES ${percentages}% GAY* ${emoji}\n*Tiene un nivel moderado*`;
      }
      break;

    case 'lesbiana':
      emoji = '🏳️‍🌈';
      if (percentages < 50) {
        description = `🔹 *${text.toUpperCase()} ES ${percentages}% LESBIANA* ${emoji}\n*Resultado bajo, casi normal*`;
      } else if (percentages > 100) {
        description = `🔥 *${text.toUpperCase()} ES ${percentages}% LESBIANA* ${emoji}\n*¡Nivel máximo de lesbianismo!*`;
      } else {
        description = `✨ *${text.toUpperCase()} ES ${percentages}% LESBIANA* ${emoji}\n*Tiene un nivel moderado*`;
      }
      break;

    case 'pajero':
    case 'pajera':
      emoji = '😏💦';
      if (percentages < 50) {
        description = `🔹 *${text.toUpperCase()} ES ${percentages}% ${command.toUpperCase()}* ${emoji}\n*Poco experto en el arte*`;
      } else if (percentages > 100) {
        description = `🔥 *${text.toUpperCase()} ES ${percentages}% ${command.toUpperCase()}* ${emoji}\n*¡Maestro absoluto de la masturbación!*`;
      } else {
        description = `✨ *${text.toUpperCase()} ES ${percentages}% ${command.toUpperCase()}* ${emoji}\n*Nivel intermedio de experiencia*`;
      }
      break;

    case 'puto':
    case 'puta':
      emoji = '🔥🥵';
      if (percentages < 50) {
        description = `🔹 *${text.toUpperCase()} ES ${percentages}% ${command.toUpperCase()}* ${emoji}\n*Poco atrevido sexualmente*`;
      } else if (percentages > 100) {
        description = `🔥 *${text.toUpperCase()} ES ${percentages}% ${command.toUpperCase()}* ${emoji}\n*¡Expertísimo en el arte sexual!*`;
      } else {
        description = `✨ *${text.toUpperCase()} ES ${percentages}% ${command.toUpperCase()}* ${emoji}\n*Tiene sus momentos de audacia*`;
      }
      break;

    case 'manco':
    case 'manca':
      emoji = '💩';
      if (percentages < 50) {
        description = `🔹 *${text.toUpperCase()} ES ${percentages}% ${command.toUpperCase()}* ${emoji}\n*Casi sabe lo que hace*`;
      } else if (percentages > 100) {
        description = `🔥 *${text.toUpperCase()} ES ${percentages}% ${command.toUpperCase()}* ${emoji}\n*¡Inútil total en todo!*`;
      } else {
        description = `✨ *${text.toUpperCase()} ES ${percentages}% ${command.toUpperCase()}* ${emoji}\n*Tiene sus momentos de torpeza*`;
      }
      break;

    case 'rata':
      emoji = '🐁';
      if (percentages < 50) {
        description = `🔹 *${text.toUpperCase()} ES ${percentages}% RATA* ${emoji}\n*Poco agarrado con el dinero*`;
      } else if (percentages > 100) {
        description = `🔥 *${text.toUpperCase()} ES ${percentages}% RATA* ${emoji}\n*¡Rata profesional nivel dios!*`;
      } else {
        description = `✨ *${text.toUpperCase()} ES ${percentages}% RATA* ${emoji}\n*No paga la cuenta a veces*`;
      }
      break;

    case 'prostituto':
    case 'prostituta':
      emoji = '🫦👅';
      if (percentages < 50) {
        description = `🔹 *${text.toUpperCase()} ES ${percentages}% ${command.toUpperCase()}* ${emoji}\n*Poco experimentado en el oficio*`;
      } else if (percentages > 100) {
        description = `🔥 *${text.toUpperCase()} ES ${percentages}% ${command.toUpperCase()}* ${emoji}\n*¡Profesional del sexo por dinero!*`;
      } else {
        description = `✨ *${text.toUpperCase()} ES ${percentages}% ${command.toUpperCase()}* ${emoji}\n*Se defiende en el negocio*`;
      }
      break;

    default:
      throw `❌ *COMANDO NO VÁLIDO*`;
  }

  const responses = [
    "¡Los resultados son 100% científicos!",
    "Basado en estudios de la Universidad de Karbot",
    "Este test fue aprobado por expertos",
    "¡Confía en los datos, son reales!",
    "Karbot-MD nunca se equivoca",
    "Resultados verificados por inteligencia artificial"
  ];

  const response = responses[Math.floor(Math.random() * responses.length)];

  const cal = `╔══════════════════════╗
                🎯 *CALCULADORA KARBOT* 🎯
╚══════════════════════╝

📊 ${description}

💡 *"${response}"*

╔══════════════════════╗
        🔮 *KARBOT-MD* 🔮
╚══════════════════════╝`.trim();

  async function loading() {
    const hawemod = [
      "《 █▒▒▒▒▒▒▒▒▒▒▒》10%",
      "《 ████▒▒▒▒▒▒▒▒》30%", 
      "《 ███████▒▒▒▒▒》50%",
      "《 ██████████▒▒》80%",
      "《 ████████████》100%"
    ];

    let { key } = await conn.sendMessage(m.chat, {text: `🔮 *CALCULANDO RESULTADOS...*`, mentions: conn.parseMention(cal)}, {quoted: m});

    for (let i = 0; i < hawemod.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      await conn.sendMessage(m.chat, {text: hawemod[i], edit: key, mentions: conn.parseMention(cal)}, {quoted: m}); 
    }

    await conn.sendMessage(m.chat, {text: cal, edit: key, mentions: conn.parseMention(cal)}, {quoted: m});         
  }

  loading()    
};

handler.help = ['gay2', 'lesbiana', 'pajero', 'pajera', 'puto', 'puta', 'manco', 'manca', 'rata', 'prostituta', 'prostituto'].map((v) => v + ' @tag | nombre');
handler.tags = ['game'];
handler.command = /^(gay2|lesbiana|pajero|pajera|puto|puta|manco|manca|rata|prostituta|prostituto)$/i;
export default handler;
