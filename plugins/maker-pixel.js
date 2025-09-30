const handler = async (m, { conn, text }) => {
  try {
    const who = m.quoted ? await m?.quoted?.sender : await m.mentionedJid && await await m.mentionedJid[0] ? await await m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
    
    // Textos aleatorios divertidos
    const randomTexts = [
      `🎮 *¡Efecto pixel aplicado!*\n▸ ¡Ahora eres un personaje de 8-bits!`,
      `🕹️ *Modo retro activado*\n▸ Imagen pixelada con éxito\n▸ Nivel de pixeles: 🔥 Máximo`,
      `✨ *Transformación pixel completa*\n▸ ¡Luces, cámara, píxeles!`,
      `🎨 *Efecto artístico aplicado*\n▸ Estilo: Pixel Art\n▸ Calidad: 8-bit premium`,
      `🔳 *Pixelización exitosa*\n▸ Resolución: Retro\n▸ Estilo: Vintage Gamer`,
      `🖼️ *¡Imagen pixelada!*\n▸ Efecto: Nostalgia 90s\n▸ Intensidad: ${Math.floor(Math.random() * 100) + 1}%`,
      `👾 *¡Modo arcade activado!*\n▸ Pixelación completada\n▸ Nivel de diversión: 💯`
    ];
    
    // Seleccionar texto aleatorio
    const randomMessage = randomTexts[Math.floor(Math.random() * randomTexts.length)];
    
    // Aplicar efecto pixel
    await conn.sendFile(m.chat, global.API('https://some-random-api.com', '/canvas/pixelate', {
      avatar: await conn.profilePictureUrl(who, 'image').catch((_) => 'https://telegra.ph/file/24fa902ead26340f3df2c.png'),
      comment: text || 'KARBOT-MD Pixel Effect',
      username: conn.getName(who),
    }), 'pixel.png', randomMessage, m, {
      mentions: [who]
    });
    
    // Agregar reacción de videojuego
    await conn.sendMessage(m.chat, {
      react: {
        text: '🎮',
        key: m.key
      }
    });
    
  } catch (error) {
    console.error('Error en pixel:', error);
    await conn.sendMessage(m.chat, { 
      text: `❌ *Error al pixelar la imagen:*\n${error.message}`
    }, { quoted: m });
  }
};

handler.help = ['pixel', 'pixelar', '8bit', 'retro'];
handler.tags = ['maker', 'fun'];
handler.command = /^(pixel|pixelar|difuminar|8bit|retro)$/i;

export default handler;