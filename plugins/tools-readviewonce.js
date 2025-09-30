const {downloadContentFromMessage} = (await import("baileys"));

const handler = async (m, {conn}) => {
  // Sistema de reacción - indicar procesamiento
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

  if (!m.quoted) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    throw `*🚫 DEBES RESPONDER A UN MENSAJE*\n\n_Responde a un mensaje viewOnce (vista única) para revelarlo_`;
  }

  if (!m.quoted.viewOnce) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    throw `*🚫 NO ES UN MENSAJE VIEWONCE*\n\n_El mensaje al que respondes no es de vista única_`;
  }

  const msg = m.quoted;
  const type = msg.mtype;

  // Reacción de procesamiento
  await conn.sendMessage(m.chat, { react: { text: '📥', key: m.key } });

  try {
    const media = await downloadContentFromMessage(msg, type == 'imageMessage' ? 'image' : type == 'videoMessage' ? 'video' : 'audio');
    let buffer = Buffer.from([]);

    for await (const chunk of media) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    // Reacción de éxito
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    if (/video/.test(type)) {
      return await conn.sendMessage(m.chat, { 
        video: buffer, 
        caption: `*📹 VIDEO REVELADO*\n\n${msg?.caption || '_Sin descripción_'}`,
        mimetype: 'video/mp4'
      }, { quoted: m });
    } else if (/image/.test(type)) {
      return await conn.sendMessage(m.chat, { 
        image: buffer, 
        caption: `*🖼️ IMAGEN REVELADA*\n\n${msg?.caption || '_Sin descripción_'}`,
        mimetype: 'image/jpeg'
      }, { quoted: m });
    } else if (/audio/.test(type)) {
      return await conn.sendMessage(m.chat, { 
        audio: buffer, 
        caption: `*🎧 AUDIO REVELADO*`,
        ptt: true,
        mimetype: 'audio/ogg; codecs=opus'
      }, { quoted: m });
    }
  } catch (error) {
    // Reacción de error
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    console.error('Error en readviewonce:', error);
    throw `*❌ ERROR AL PROCESAR*\n\n_No se pudo revelar el archivo viewOnce_`;
  }
};

handler.help = ['readvo'];
handler.tags = ['tools'];
handler.command = /^(readviewonce|read|revelar|readvo|ver)$/i;
export default handler;