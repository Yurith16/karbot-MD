import fetch from "node-fetch";

// Sistema de descargas activas por usuario
const activeDownloads = new Map();

// Función para verificar si el usuario tiene una descarga activa
function checkActiveDownload(userId) {
  return activeDownloads.has(userId);
}

const handler = async (m, { conn, usedPrefix, args }) => {
  const userId = m.sender;
  const userNumber = userId.split("@")[0];
  const text = args.join(" ").trim();

  // Verificar si el usuario ya tiene una descarga en proceso
  if (checkActiveDownload(userNumber)) {
    await conn.reply(
      m.chat,
      `⏳ *ESPERA*\n\n` +
        `Ya tienes una búsqueda en curso. Espera a que termine para volver a intentar.`,
      m
    );
    return;
  }

  if (!text) {
    await conn.reply(
      m.chat,
      `📸 *BUSCAR FOTOS HD*\n\n` +
        `❌ Debes especificar un tema para buscar.\n\n` +
        `💡 *Uso:* ${usedPrefix}unsplash [tema]\n` +
        `📌 *Ejemplo:* ${usedPrefix}unsplash paisajes naturales`,
      m
    );
    return;
  }

  try {
    // Marcar que el usuario tiene una búsqueda activa
    activeDownloads.set(userNumber, true);

    // Reacción de procesando
    await conn.sendMessage(m.chat, {
      react: { text: "🔍", key: m.key },
    });

    // Mensaje inicial
    await conn.reply(
      m.chat,
      `🔍 *BUSCANDO FOTOS*\n\n` +
        `📝 *Tema:* ${text}\n` +
        `⏳ Procesando tu búsqueda...`,
      m
    );

    // Buscar fotos usando la API de Unsplash
    const apiUrl = `https://api.dorratz.com/v3/unsplash?query=${encodeURIComponent(text)}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Error en la API: ${response.status}`);
    }

    const data = await response.json();

    if (
      !data ||
      !data.result ||
      !Array.isArray(data.result) ||
      data.result.length === 0
    ) {
      throw new Error("No se encontraron resultados para tu búsqueda");
    }

    // Reacción de éxito
    await conn.sendMessage(m.chat, {
      react: { text: "📥", key: m.key },
    });

    // Enviar las primeras 5 fotos (para no saturar)
    const photosToSend = data.result.slice(0, 5);
    let sentCount = 0;

    for (let i = 0; i < photosToSend.length; i++) {
      const photo = photosToSend[i];

      try {
        const photoUrl = photo.urls?.regular || photo.urls?.full;

        if (photoUrl) {
          await conn.sendMessage(m.chat, {
            image: { url: photoUrl },
            caption:
              `📸 *FOTO ${i + 1}/${photosToSend.length}*\n\n` +
              `📝 *Tema:* ${text}\n` +
              `👤 *Fotógrafo:* ${photo.user?.name || "Desconocido"}\n` +
              `❤️ *Likes:* ${photo.likes || 0}\n` +
              `🌐 *Fuente:* Unsplash`,
          });
          sentCount++;

          // Pequeña pausa entre envíos
          if (i < photosToSend.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      } catch (photoError) {
        console.log(`Error enviando foto ${i + 1}:`, photoError.message);
        continue;
      }
    }

    if (sentCount > 0) {
      // Reacción final de éxito
      await conn.sendMessage(m.chat, {
        react: { text: "✅", key: m.key },
      });

      await conn.reply(
        m.chat,
        `✅ *BÚSQUEDA COMPLETADA*\n\n` +
          `📊 *Resultados:* ${sentCount} fotos enviadas\n` +
          `📝 *Tema buscado:* ${text}\n` +
          `💡 Puedes buscar más fotos con el mismo comando.`,
        m
      );
    } else {
      throw new Error("No se pudieron cargar las fotos");
    }
  } catch (error) {
    console.error("Error en comando Unsplash:", error);

    // Reacción de error
    await conn.sendMessage(m.chat, {
      react: { text: "❌", key: m.key },
    });

    let errorMessage = "";

    if (error.message.includes("No se encontraron resultados")) {
      errorMessage =
        `❌ *SIN RESULTADOS*\n\n` +
        `No se encontraron fotos para: "${text}"\n\n` +
        `💡 *Sugerencias:*\n` +
        `• Intenta con palabras más específicas\n` +
        `• Verifica la ortografía\n` +
        `• Prueba con términos en inglés`;
    } else if (error.message.includes("Error en la API")) {
      errorMessage =
        `❌ *ERROR DE CONEXIÓN*\n\n` +
        `Hubo un problema con el servicio de búsqueda.\n\n` +
        `🔧 Intenta nuevamente en unos minutos.`;
    } else {
      errorMessage =
        `❌ *ERROR*\n\n` +
        `Ocurrió un problema inesperado.\n\n` +
        `🔧 ${error.message}`;
    }

    await conn.reply(m.chat, errorMessage, m);
  } finally {
    // Liberar al usuario de las búsquedas activas
    activeDownloads.delete(userNumber);
  }
};

handler.help = ["unsplash <tema>", "foto <tema>", "imagenhd <tema>"];
handler.tags = ["descargas", "busqueda"];
handler.command = /^(unsplash|foto|imagenhd)$/i;
handler.limit = false;

export default handler;
