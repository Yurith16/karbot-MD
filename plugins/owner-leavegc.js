const handler = async (m, {conn, text}) => {
  const id = text ? text : m.chat;

  // Verificar si es un grupo válido
  if (!id.endsWith('@g.us')) {
    // Reacción de error
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      });
    } catch (reactError) {}

    throw '❌ *ID DE GRUPO INVÁLIDO*\n\nEl ID proporcionado no corresponde a un grupo de WhatsApp.';
  }

  try {
    // Obtener información del grupo antes de salir
    const groupInfo = await conn.groupMetadata(id);
    const groupName = groupInfo.subject || 'Grupo sin nombre';

    // Reacción de salida
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '👋',
          key: m.key
        }
      });
    } catch (reactError) {}

    // Mensaje de despedida en el grupo
    await conn.reply(id, `👋 *¡Adiós!*\n\nEl bot está abandonando este grupo.\n\n📝 *Grupo:* ${groupName}\n🤖 *Motivo:* Solicitud del propietario\n\n¡Gracias por usar el bot! 🚀`);

    // Salir del grupo
    await conn.groupLeave(id);

    // Confirmación al propietario
    await conn.reply(m.chat, `✅ *BOT SALIÓ DEL GRUPO*\n\n📝 *Grupo:* ${groupName}\n🔗 *ID:* ${id}\n\nEl bot ha abandonado el grupo exitosamente.`);

  } catch (error) {
    console.error('Error al salir del grupo:', error);

    // Reacción de error
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      });
    } catch (reactError) {}

    throw `❌ *ERROR AL SALIR DEL GRUPO*\n\nNo se pudo abandonar el grupo. Posibles causas:\n• El bot no está en ese grupo\n• ID de grupo incorrecto\n• Problemas de conexión`;
  }
};

handler.command = /^(out|leavegc|leave|salirdelgrupo|salir|botout)$/i;
handler.group = true;
handler.rowner = true;
handler.help = ['leavegc'];

export default handler;