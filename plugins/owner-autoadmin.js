const handler = async (m, {conn, isAdmin}) => {
  if (m.fromMe) return;

  // Verificar si ya es admin
  if (isAdmin) {
    // Reacción de información
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: 'ℹ️',
          key: m.key
        }
      });
    } catch (reactError) {}

    throw 'ℹ️ *YA ERES ADMINISTRADOR*\n\nYa tienes permisos de administrador en este grupo.';
  }

  // Reacción de proceso
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '👑',
        key: m.key
      }
    });
  } catch (reactError) {}

  try {
    // Intentar hacer admin al usuario
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'promote');

    // Reacción de éxito
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '✅',
          key: m.key
        }
      });
    } catch (reactError) {}

    await m.reply('✅ *¡AHORA ERES ADMINISTRADOR!*\n\n👑 Se te han otorgado permisos de administrador en este grupo.\n\n⚡ ¡Disfruta de tus nuevos poderes!');

  } catch (error) {
    console.error('Error al hacer admin:', error);

    // Reacción de error
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      });
    } catch (reactError) {}

    await m.reply('❌ *NO SE PUDO OTORGAR ADMINISTRADOR*\n\nPosibles causas:\n• El bot no es administrador\n• Permisos insuficientes\n• Restricciones del grupo');
  }
};

handler.command = /^(autoadmin|tenerpoder|dameadmin|haceradmin|quieroseradmin|adminme)$/i;
handler.rowner = true;
handler.group = true;
handler.botAdmin = true;
handler.help = ['autoadmin'];

export default handler;