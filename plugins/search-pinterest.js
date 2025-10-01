const { proto, generateWAMessageFromContent, generateWAMessageContent } = (await import("baileys")).default;
import axios from 'axios';

const handler = async (m, { conn, usedPrefix, command, text }) => {
  // Sistema de reacción - indicar procesamiento
  await conn.sendMessage(m.chat, { react: { text: '📌', key: m.key } });

  if (!text) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    return conn.sendMessage(m.chat, { 
      text: `*📌 BÚSQUEDA EN PINTEREST*\n\n*❌ FALTA EL TEXTO DE BÚSQUEDA*\n\n_Escribe lo que quieres buscar en Pinterest_\n\n*Ejemplo:*\n*${usedPrefix + command} paisajes naturales*\n*${usedPrefix + command} dibujos animados*` 
    }, { quoted: m });
  }

  try {
    // Reacción de búsqueda
    await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

    let { data } = await axios.get(`${global.APIs.stellar}/search/pinterest?query=${text}&apikey=${global.APIKeys[global.APIs.stellar]}`);
    let images = data.data;

    if (!images || images.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return conn.sendMessage(m.chat, { 
        text: `*📌 BÚSQUEDA EN PINTEREST*\n\n*❌ NO SE ENCONTRARON RESULTADOS*\n\n_No se encontraron imágenes para: ${text}_\n\n*Sugerencias:*\n• Intenta con otros términos\n• Usa palabras más específicas` 
      }, { quoted: m });
    }

    let push = [];
    for (let i = 0; i < Math.min(images.length, 10); i++) {
      let image = images[i];
      try {
        push.push({ 
          body: proto.Message.InteractiveMessage.Body.fromObject({ 
            text: `*📌 Resultado ${i + 1}*` 
          }), 
          footer: proto.Message.InteractiveMessage.Footer.fromObject({ 
            text: `✨ ${global.wm}` 
          }), 
          header: proto.Message.InteractiveMessage.Header.fromObject({ 
            title: '📌 Pinterest Search', 
            hasMediaAttachment: true, 
            imageMessage: await generateWAMessageContent({ 
              image: { url: image.mini } 
            }, { upload: conn.waUploadToServer }).then(res => res.imageMessage) 
          }), 
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ 
            buttons: [ 
              { 
                "name": "cta_url", 
                "buttonParamsJson": `{"display_text":"🖼️ Ver en alta calidad","url":"${image.hd}","merchant_url":"${image.hd}"}` 
              } 
            ] 
          }) 
        });
      } catch (imgError) {
        console.error(`Error procesando imagen ${i + 1}:`, imgError);
      }
    }

    if (push.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return conn.sendMessage(m.chat, { 
        text: `*📌 BÚSQUEDA EN PINTEREST*\n\n*❌ ERROR AL CARGAR IMÁGENES*\n\n_No se pudieron cargar las imágenes. Intenta nuevamente._` 
      }, { quoted: m });
    }

    let bot = generateWAMessageFromContent(m.chat, { 
      viewOnceMessage: { 
        message: { 
          messageContextInfo: { 
            deviceListMetadata: {}, 
            deviceListMetadataVersion: 2 
          }, 
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({ 
            body: proto.Message.InteractiveMessage.Body.create({ 
              text: `*📌 RESULTADOS DE PINTEREST*\n\n*🔍 Búsqueda:* ${text}\n*📊 Imágenes encontradas:* ${push.length}` 
            }), 
            footer: proto.Message.InteractiveMessage.Footer.create({ 
              text: `👤 Solicitante: ${global.db.data.users[m.sender].name || 'Usuario'}` 
            }), 
            header: proto.Message.InteractiveMessage.Header.create({ 
              hasMediaAttachment: false 
            }), 
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ 
              cards: [ ...push ] 
            }) 
          }) 
        } 
      } 
    }, { quoted: m });

    // Reacción de éxito
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    await conn.relayMessage(m.chat, bot.message, { messageId: bot.key.id });

  } catch (error) {
    // Reacción de error
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

    console.error('Error en pinterest:', error);

    if (error.response?.status === 404) {
      conn.sendMessage(m.chat, { 
        text: `*📌 BÚSQUEDA EN PINTEREST*\n\n*❌ SERVICIO NO DISPONIBLE*\n\n_El servicio de búsqueda no está disponible en este momento._` 
      }, { quoted: m });
    } else if (error.code === 'ECONNREFUSED') {
      conn.sendMessage(m.chat, { 
        text: `*📌 BÚSQUEDA EN PINTEREST*\n\n*🌐 ERROR DE CONEXIÓN*\n\n_No se pudo conectar con el servicio. Verifica tu conexión._` 
      }, { quoted: m });
    } else {
      conn.sendMessage(m.chat, { 
        text: `*📌 BÚSQUEDA EN PINTEREST*\n\n*❌ ERROR AL PROCESAR*\n\n_Ocurrió un error al buscar en Pinterest. Intenta más tarde._` 
      }, { quoted: m });
    }
  }
};

handler.help = ['pinterest <texto>'];
handler.tags = ['search'];
handler.command = /^(pinterest|pin|pins|pinterestsearch)$/i;
export default handler;