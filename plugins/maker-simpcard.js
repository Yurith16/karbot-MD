const handler = async (m, { conn }) => {
  try {
    const who = m.quoted ? await m?.quoted?.sender : await m.mentionedJid && await await m.mentionedJid[0] ? await await m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
    
    // Aplicar efecto simpcard
    await conn.sendFile(m.chat, global.API('https://some-random-api.com', '/canvas/simpcard', {
      avatar: await conn.profilePictureUrl(who, 'image').catch((_) => 'https://telegra.ph/file/24fa902ead26340f3df2c.png'),
    }), 'simpcard.png', `💖 *¡Tarjeta de Simp Creada!*

▸ *Usuario:* @${who.split('@')[0]}
▸ *Nivel de Simp:* 🔥 100%
▸ *Certificado por:* KARBOT-MD
▸ *Fecha:* ${new Date().toLocaleDateString()}

✨ *¡Felicidades! Eres un verdadero simp*`, m, {
      mentions: [who]
    });
    
    // Agregar reacción de corazón
    await conn.sendMessage(m.chat, {
      react: {
        text: '💖',
        key: m.key
      }
    });
    
  } catch (error) {
    console.error('Error en simpcard:', error);
    await conn.sendMessage(m.chat, { 
      text: `❌ *Error al crear la tarjeta simp:*\n${error.message}`
    }, { quoted: m });
  }
};

handler.help = ['simpcard', 'simptarjeta', 'simp'];
handler.tags = ['maker', 'fun'];
handler.command = /^(simpcard|simptarjeta|simp)$/i;

export default handler;