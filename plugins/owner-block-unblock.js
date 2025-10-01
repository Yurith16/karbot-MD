const handler = async (m, {text, conn, usedPrefix, command}) => {
  const why = `❌ *DEBES MENCIONAR UN USUARIO*\n\nUso: *${usedPrefix + command} @usuario*\nO responde a un mensaje con: *${usedPrefix + command}*`;

  const who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : false;

  if (!who) {
    // Reacción de error
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      });
    } catch (reactError) {}

    return conn.reply(m.chat, why, m, {mentions: [m.sender]});
  }

  const res = [];

  switch (command) {
    case 'block':
      // Reacción de bloqueo
      try {
        await conn.sendMessage(m.chat, {
          react: {
            text: '🚫',
            key: m.key
          }
        });
      } catch (reactError) {}

      if (who) {
        await conn.updateBlockStatus(who, 'block').then(() => {
          res.push(who);
        });
      }
      break;

    case 'unblock':
      // Reacción de desbloqueo
      try {
        await conn.sendMessage(m.chat, {
          react: {
            text: '✅',
            key: m.key
          }
        });
      } catch (reactError) {}

      if (who) {
        await conn.updateBlockStatus(who, 'unblock').then(() => {
          res.push(who);
        });
      }
      break;
  }

  if (res[0]) {
    const action = command === 'block' ? 'BLOQUEADO' : 'DESBLOQUEADO';
    const emoji = command === 'block' ? '🚫' : '✅';

    const message = `${emoji} *USUARIO ${action}*\n\n👤 *Usuario:* @${who.split('@')[0]}\n⚡ *Acción:* ${command === 'block' ? 'Bloqueado' : 'Desbloqueado'}\n\n${command === 'block' ? 'El usuario ya no podrá contactarte.' : 'El usuario puede contactarte nuevamente.'}`;

    conn.reply(m.chat, message, m, {mentions: res});
  }
};

handler.command = /^(block|unblock|bloquear|desbloquear)$/i;
handler.rowner = true;
handler.help = ['block @usuario', 'unblock @usuario'];

export default handler;