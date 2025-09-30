/* Desarrollado y Creado por: HERNANDEZ - KARBOT-MD */

const toM = (a) => '@' + a.split('@')[0];

function handler(m, {groupMetadata}) {
  const ps = groupMetadata.participants.map((v) => v.id);
  const a = ps.getRandom();
  let b;

  do {
    b = ps.getRandom();
  } while (b === a);

  const messages = [
    `💘 *¡NUEVA PAREJA FORMADA!*\n\n${toM(a)} 💞 ${toM(b)}\n\n*¡Que su amor dure para siempre!* ✨`,
    `❤️ *¡MATCH PERFECTO!*\n\n${toM(a)} + ${toM(b)} = 💑\n\n*Karbot los declara pareja oficial* 👑`,
    `🔥 *¡PAREJA DEL AÑO!*\n\n${toM(a)} 🎯 ${toM(b)}\n\n*Enhorabuena por este hermoso match* 🌹`,
    `💕 *¡AMOR EN EL AIRE!*\n\n${toM(a)} 💖 ${toM(b)}\n\n*El destino los ha unido* ✨`,
    `👰‍♂️🤵‍♀️ *¡FUTURA BODA!*\n\n${toM(a)} 💍 ${toM(b)}\n\n*Karbot predice boda próxima* 🎉`,
    `💏 *¡PAREJA IDEAL!*\n\n${toM(a)} 🥰 ${toM(b)}\n\n*Combinación perfecta encontrada* 💫`
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  m.reply(randomMessage, null, {
    mentions: [a, b],
  });
}

handler.help = ['formarpareja'];
handler.tags = ['game'];
handler.command = ['formarpareja', 'formarparejas', 'pareja', 'match'];
handler.group = true;
export default handler;