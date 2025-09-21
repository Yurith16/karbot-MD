const handler = async (m, {conn, args, usedPrefix, command}) => {
  const isClose = { 
    'open': 'not_announcement',
    'close': 'announcement',
    'abierto': 'not_announcement',
    'cerrado': 'announcement',
    'abrir': 'not_announcement',
    'cerrar': 'announcement',
    'on': 'not_announcement',
    'off': 'announcement',
    'activar': 'not_announcement',
    'desactivar': 'announcement'
  }[args[0]?.toLowerCase() || ''];

  if (isClose === undefined) {
    throw `🔧 *CONFIGURACIÓN DE GRUPO - KARBOT-MD* 🔧

❌ *DEBES ESPECIFICAR UNA OPCIÓN*

💡 *Opciones disponibles:*
• ${usedPrefix + command} abrir  -  🔓 Grupo abierto
• ${usedPrefix + command} cerrar -  🔒 Grupo cerrado
• ${usedPrefix + command} on     -  🔓 Activado
• ${usedPrefix + command} off    -  🔒 Desactivado`.trim();
  }

  await conn.groupSettingUpdate(m.chat, isClose);

  if (isClose === 'not_announcement') {
    m.reply(`✅ *GRUPO ABIERTO*\n\n🔓 *Ahora cualquier miembro puede enviar mensajes*`);
  } else {
    m.reply(`✅ *GRUPO CERRADO*\n\n🔒 *Solo administradores pueden enviar mensajes*`);
  }
};

handler.help = ['group open / close', 'grupo abrir / cerrar'];
handler.tags = ['group'];
handler.command = ['group', 'grupo', 'config'];
handler.admin = true;
handler.botAdmin = true;
export default handler;
