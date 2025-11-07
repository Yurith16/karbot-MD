/* Karbot - Convertir Sticker a Imagen */

const handler = async (m, {conn, usedPrefix, command}) => {
  const jid = m.chat;

  try {
    const quoted = m.quoted ? m.quoted : m;
    const quotedMessage = quoted.msg || quoted;

    if (!quotedMessage) {
      return await conn.sendMessage(jid, {
        text: `*「🖼️」 Convertir a Imagen*\n\n> ✦ *Responde a un sticker con:* » ${usedPrefix + command}\n> ✦ *Función:* » Convertir sticker a formato PNG`
      }, { quoted: m });
    }

    const mediaType = quotedMessage.stickerMessage ? 'sticker' : null;
    if (!mediaType) {
      return await conn.sendMessage(jid, {
        text: '*「❌」 Error*\n\n> ✦ *Solo puedes convertir stickers a imagen*'
      }, { quoted: m });
    }

    // Reacción de procesamiento
    await conn.sendMessage(jid, {
      react: { text: '🔄', key: m.key }
    });

    await conn.sendMessage(jid, {
      text: `*「🔄」 Procesando*\n\n> ✦ *Convirtiendo sticker a imagen...*`
    }, { quoted: m });

    // Descargar el sticker
    let mediaBuffer;
    try {
      const { downloadContentFromMessage } = await import('@whiskeysockets/baileys');
      const stream = await downloadContentFromMessage(quotedMessage.stickerMessage, 'sticker');
      let buffer = Buffer.from([]);

      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      mediaBuffer = buffer;
    } catch (error) {
      throw new Error('No se pudo descargar el sticker: ' + error.message);
    }

    if (!mediaBuffer || mediaBuffer.length === 0) {
      throw new Error('El sticker descargado está vacío');
    }

    // Enviar el buffer directamente como imagen (WhatsApp convierte automáticamente)
    await conn.sendMessage(jid, {
      image: mediaBuffer,
      caption: `*「✅」 Conversión Exitosa*\n\n> ✦ *Formato:* » PNG\n> ✦ *Tamaño:* » ${(mediaBuffer.length / 1024).toFixed(2)} KB\n> ✦ *Método:* » Conversión automática de WhatsApp`
    }, { quoted: m });

    // Reacción de éxito
    await conn.sendMessage(jid, {
      react: { text: '✅', key: m.key }
    });

  } catch (error) {
    console.error('Error en toimg:', error);
    await conn.sendMessage(jid, {
      react: { text: '❌', key: m.key }
    });

    await conn.sendMessage(jid, {
      text: `*「❌」 Error de Conversión*\n\n> ✦ *Error:* » ${error.message}`
    }, { quoted: m });
  }
};

handler.help = ['toimg'];
handler.tags = ['converter'];
handler.command = ['toimg', 'jpg', 'img'];

export default handler;