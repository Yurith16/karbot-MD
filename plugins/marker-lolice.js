const handler = async (m, { conn }) => {
  try {
    const who = m.quoted ? await m?.quoted?.sender : await m.mentionedJid && await await m.mentionedJid[0] ? await await m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
    
    // Textos aleatorios divertidos para lolice
    const randomTexts = [
      `🚔 *¡Patrulla LOLI detectada!*\n▸ Usuario bajo investigación\n▸ Nivel de sospecha: ${Math.floor(Math.random() * 100) + 1}%`,
      `👮‍♂️ *Departamento de LOLICIA*\n▸ Usuario reportado: @${who.split('@')[0]}\n▸ Estado: Bajo vigilancia`,
      `🔍 *Investigación en curso*\n▸ Subject: @${who.split('@')[0]}\n▸ Evidencia: Inspección de perfil`,
      `📋 *Reporte de actividad sospechosa*\n▸ Agente: KARBOT-MD\n▸ Código: LOLI-ALERT-${Math.floor(Math.random() * 1000)}`,
      `🚨 *Alerta de seguridad activada*\n▸ Protocolo LOLICE iniciado\n▸ Usuario en la lista de observación`,
      `🕵️‍♂️ *Detective virtual en acción*\n▸ Caso: Análisis de perfil\n▸ Resultado: Inspección completada`,
      `⚖️ *Tribunal de internet*\n▸ Acusación: Sospecha de contenido\n▸ Veredicto: Investigación aprobada`
    ];
    
    // Seleccionar texto aleatorio
    const randomMessage = randomTexts[Math.floor(Math.random() * randomTexts.length)];
    
    // Aplicar efecto lolice
    await conn.sendFile(m.chat, global.API('https://some-random-api.com', '/canvas/lolice', {
      avatar: await conn.profilePictureUrl(who, 'image').catch((_) => 'https://telegra.ph/file/24fa902ead26340f3df2c.png'),
    }), 'lolice.png', randomMessage, m, {
      mentions: [who]
    });
    
    // Agregar reacción de policía
    await conn.sendMessage(m.chat, {
      react: {
        text: '👮',
        key: m.key
      }
    });
    
  } catch (error) {
    console.error('Error en lolice:', error);
    await conn.sendMessage(m.chat, { 
      text: `❌ *Error en la investigación:*\n${error.message}`
    }, { quoted: m });
  }
};

handler.help = ['lolice', 'lolipolice', 'lolidetective'];
handler.tags = ['maker', 'fun'];
handler.command = /^(lolice|lolipolice|lolidetective)$/i;

export default handler;