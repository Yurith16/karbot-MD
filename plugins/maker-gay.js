const handler = async (m, { conn }) => {
  try {
    // Obtener el usuario mencionado o el que envió el mensaje
    const who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
    
    // Obtener la imagen de perfil
    const profilePicture = await conn.profilePictureUrl(who, 'image').catch((_) => 'https://telegra.ph/file/24fa902ead26340f3df2c.png');
    
    // Aplicar efecto gay a la imagen
    await conn.sendFile(m.chat, global.API('https://some-random-api.com', '/canvas/gay', {
      avatar: profilePicture,
    }), 'rainbow.png', `🌈 *¡Uyy, Kejesooo!*`, m);
    
    // Agregar reacción al mensaje (emoji)
    await conn.sendMessage(m.chat, {
      react: {
        text: '🌈', // Emoji de arcoíris
        key: m.key
      }
    });
    
  } catch (error) {
    // Manejo de errores
    console.error('Error en comando gay:', error);
    await conn.sendMessage(m.chat, { 
      text: `❌ *Error al aplicar el efecto:*\n${error.message}`,
      react: {
        text: '❌', // Emoji de error
        key: m.key
      }
    }, { quoted: m });
  }
};

handler.help = ['gay', 'rainbow', 'arcoiris'];
handler.tags = ['maker', 'fun'];
handler.command = /^(gay|rainbow|arcoiris)$/i;

export default handler;