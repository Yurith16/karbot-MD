import {createHash} from 'crypto';

const handler = async function(m, {conn, text, usedPrefix}) {
  const sn = createHash('md5').update(m.sender).digest('hex');

  // Sistema de reacción
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '🔐',
        key: m.key
      }
    });
  } catch (reactError) {
    // Ignorar error de reacción
  }

  const message = `┌──「 🔐 NÚMERO DE SERIE 」
│ 
│ *Tu número de serie único es:*
│ 
│ ${sn}
│ 
│ *⚠️ IMPORTANTE:*
│ Guarda este número para
│ acciones importantes como
│ eliminar tu registro.
└──────────────`.trim();

  m.reply(message);
};

handler.help = ['myns'];
handler.tags = ['xp'];
handler.command = /^(myns|ceksn)$/i;
handler.register = true;

export default handler;