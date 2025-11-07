const handler = async (m, { conn, text }) => {
  const id = text ? text : m.chat;

  // Verificar si es un grupo válido
  if (!id.endsWith('@g.us')) {
    await conn.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    });
    return await conn.sendMessage(m.chat, {
      text: `*「❌」 ID Inválido*\n\n> ✦ *El ID no corresponde a un grupo*`
    }, { quoted: m });
  }

  try {
    // Obtener información del grupo
    const groupInfo = await conn.groupMetadata(id);
    const groupName = groupInfo.subject || 'Grupo sin nombre';

    // Reacción de proceso
    await conn.sendMessage(m.chat, {
      react: { text: '👋', key: m.key }
    });

    // Mensaje de despedida en el grupo
    await conn.sendMessage(id, {
      text: `*「👋」 Bot Saliendo*\n\n> ✦ *El bot está abandonando el grupo*\n> ✦ *Grupo:* » ${groupName}\n> ✦ *Motivo:* » Solicitud del propietario`
    });

    // Salir del grupo
    await conn.groupLeave(id);

    // Confirmación al propietario
    await conn.sendMessage(m.chat, {
      text: `*「✅」 Bot Salido*\n\n> ✦ *Grupo:* » ${groupName}\n> ✦ *ID:* » ${id}\n> ✦ *Estado:* » Abandonado exitosamente`
    }, { quoted: m });

  } catch (error) {
    console.error('Error al salir del grupo:', error);

    await conn.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    });

    await conn.sendMessage(m.chat, {
      text: `*「❌」 Error al Salir*\n\n> ✦ *Error:* » ${error.message}\n> ✦ *Posibles causas:*\n> • Bot no está en el grupo\n> • ID incorrecto\n> • Problemas de conexión`
    }, { quoted: m });
  }
};

handler.command = /^(out|leavegc|leave|salirdelgrupo|salir|botout)$/i;
handler.group = true;
handler.rowner = true;
handler.help = ['leavegc'];

export default handler;