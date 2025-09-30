import uploadImage from '../src/libraries/uploadImage.js';
import fetch from 'node-fetch';

const handler = async (m, {conn, text, usedPrefix, command}) => {
  // Sistema de reacción - indicar procesamiento
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';

  if (!mime) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    throw `*🚫 DEBES ENVIAR O RESPONDER A UNA IMAGEN*\n\n_Envía o responde a una imagen que contenga un código QR_`;
  }

  if (!/image\/(jpe?g|png)/.test(mime)) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    throw `*🚫 FORMATO NO VÁLIDO*\n\n_Solo se permiten imágenes JPEG o PNG_`;
  }

  try {
    // Reacción de procesamiento
    await conn.sendMessage(m.chat, { react: { text: '📷', key: m.key } });

    const img = await q.download?.();
    const url = await uploadImage(img);
    const anu = await fetch(`https://api.lolhuman.xyz/api/read-qr?apikey=${lolkeysapi}&img=${url}`);
    const json = await anu.json();

    if (!json.result) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      throw `*❌ NO SE DETECTÓ CÓDIGO QR*\n\n_No se pudo leer ningún código QR en la imagen_`;
    }

    // Reacción de éxito
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    await m.reply(`*📷 CÓDIGO QR LEÍDO*\n\n*🔍 Contenido:*\n${json.result}\n\n*💡 Tip: Puedes copiar el texto para usarlo*`);

  } catch (error) {
    // Reacción de error
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    console.error('Error en readqr:', error);
    throw `*❌ ERROR AL LEER QR*\n\n_No se pudo procesar la imagen. Intenta con otra imagen._`;
  }
};

handler.help = ['readqr'];
handler.tags = ['tools'];
handler.command = /^(readqr|leerqr|qr|scanqr)$/i;
export default handler;