import { googleImage } from "@bochilteam/scraper";

const handler = async (m, { conn, text, usedPrefix, command }) => {
  // Sistema de reacción - Indicar que el comando fue detectado
  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

  if (!text) {
    await conn.sendMessage(
      m.chat,
      {
        text: `> 🜸 *agrega una búsqueda* » ingresa lo que quieres buscar\n> 🜸 *ejemplo* » ${usedPrefix + command} paisajes`,
      },
      { quoted: m }
    );
    return;
  }

  try {
    // Cambiar reacción a "buscando"
    await conn.sendMessage(m.chat, { react: { text: "🔍", key: m.key } });

    // Buscar imágenes usando el scraper
    const images = await googleImage(text);

    if (!images || images.length === 0) {
      throw new Error("no se encontraron imágenes");
    }

    // Tomar las primeras 5 imágenes
    const selectedImages = images.slice(0, 5);

    await conn.sendMessage(m.chat, { react: { text: "📥", key: m.key } });

    // Enviar mensaje informativo
    await conn.sendMessage(
      m.chat,
      {
        text: `> 🜸 *buscando* » ${text}\n> 🜸 *enviando* » 5 imágenes encontradas`,
      },
      { quoted: m }
    );

    // Enviar las 5 imágenes
    for (let i = 0; i < selectedImages.length; i++) {
      await conn.sendMessage(m.chat, {
        image: { url: selectedImages[i] },
        caption:
          i === 0
            ? `> 🜸 *${text}* » (${i + 1}/5)`
            : `> 🜸 *imagen ${i + 1}* » /5`,
      });

      // Pequeña pausa entre envíos
      if (i < selectedImages.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Reacción de éxito
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (error) {
    // Reacción de error
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    await conn.sendMessage(
      m.chat,
      {
        text: `> 🜸 *error en la búsqueda* » ${error.message}`,
      },
      { quoted: m }
    );
  }
};

handler.help = [
  "imagen <texto>",
  "img <texto>",
  "image <texto>",
  "gimage <texto>",
];
handler.tags = ["busqueda"];
handler.command = /^(imagen|img|image|gimage)$/i;
export default handler;
