import axios from "axios";
import cheerio from "cheerio";
import { lookup } from "mime-types";

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text) {
      await conn.sendMessage(
        m.chat,
        {
          text: `❀ Ingresa un enlace de MediaFire.\n> *Ejemplo:* ${usedPrefix + command} https://www.mediafire.com/file/ejemplo/file.zip`,
        },
        { quoted: m }
      );
      return;
    }

    await conn.sendMessage(m.chat, {
      react: { text: "🔍", key: m.key },
    });

    console.log("🔍 Procesando enlace MediaFire:", text);

    // Obtener información del archivo
    const fileInfo = await mediafireDl(text);
    const { name: fileName, size, date, mime, link } = fileInfo;

    console.log("✅ Archivo encontrado:", fileName);

    // Mostrar información del archivo con la nueva estética
    const fileDetails =
      ` *「✦」 ${fileName}*\n\n` +
      `> ✦ *Tamaño:* » ${size}\n` +
      `> ⴵ *Fecha:* » ${date}\n` +
      `> ✰ *Tipo:* » ${mime}\n` +
      `> ✐ *Enlace:* » ${text}\n` +
      `> 🜸 *MEDIAFIRE*`;

    await conn.sendMessage(
      m.chat,
      {
        text: fileDetails.trim(),
      },
      { quoted: m }
    );

    await conn.sendMessage(m.chat, {
      react: { text: "📥", key: m.key },
    });

    console.log("⬇️ Descargando archivo...");

    // Descargar y enviar el archivo
    const response = await axios({
      method: "GET",
      url: link,
      responseType: "stream",
      timeout: 60000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const chunks = [];
    for await (const chunk of response.data) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    await conn.sendMessage(m.chat, {
      react: { text: "⬆️", key: m.key },
    });

    console.log("📄 Enviando como documento...");

    // Enviar siempre como documento
    await conn.sendMessage(
      m.chat,
      {
        document: fileBuffer,
        mimetype: mime,
        fileName: fileName,
        caption: `📁 *${fileName}*\n💾 ${size}\n📅 ${date}\n🔗 MediaFire Download`,
      },
      { quoted: m }
    );

    await conn.sendMessage(m.chat, {
      react: { text: "✅", key: m.key },
    });

    console.log("✅ Proceso completado exitosamente");
  } catch (error) {
    console.error("❌ Error en mediafire:", error);

    await conn.sendMessage(m.chat, {
      react: { text: "❌", key: m.key },
    });

    let errorMessage = `❌ Error al procesar la solicitud:\n${error.message}`;

    if (error.message.includes("URL de MediaFire inválida")) {
      errorMessage = "❌ Enlace de MediaFire no válido.";
    } else if (
      error.message.includes("No se pudo encontrar el enlace de descarga")
    ) {
      errorMessage =
        "❌ No se pudo encontrar el archivo en el enlace proporcionado.";
    } else if (error.message.includes("timeout")) {
      errorMessage =
        "❌ Tiempo de espera agotado. El archivo puede ser muy grande.";
    } else if (error.message.includes("Network Error")) {
      errorMessage =
        "❌ Error de conexión. Verifica tu internet e intenta nuevamente.";
    }

    await conn.sendMessage(
      m.chat,
      {
        text: errorMessage,
      },
      { quoted: m }
    );
  }
};

async function mediafireDl(url) {
  try {
    if (!url.includes("mediafire.com")) {
      throw new Error("URL de MediaFire inválida");
    }

    let res;
    let $;
    let link = null;

    // MÉTODO 1: Descarga directa
    try {
      res = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
          Referer: "https://www.mediafire.com/",
        },
        timeout: 30000,
      });

      $ = cheerio.load(res.data);

      // Buscar enlace de descarga en diferentes ubicaciones
      const downloadButton = $("#downloadButton");
      link = downloadButton.attr("href");

      // Si no se encuentra en el href principal, buscar en data attributes
      if (!link || link.includes("javascript:void(0)")) {
        link =
          downloadButton.attr("data-href") ||
          downloadButton.attr("data-url") ||
          downloadButton.attr("data-link");

        // Intentar decodificar URL cifrada
        const scrambledUrl = downloadButton.attr("data-scrambled-url");
        if (scrambledUrl) {
          try {
            link = Buffer.from(scrambledUrl, "base64").toString("utf8");
          } catch (e) {
            console.log("Error decodificando URL cifrada:", e.message);
          }
        }
      }

      // Búsqueda alternativa en el contenido HTML
      if (!link || link.includes("javascript:void(0)")) {
        const htmlContent = res.data;

        // Patrón 1: Enlaces directos de descarga
        const linkMatch = htmlContent.match(
          /href="(https:\/\/download\d+\.mediafire\.com[^"]+)"/
        );
        if (linkMatch) {
          link = linkMatch[1];
        }
        // Patrón 2: Enlaces alternativos
        else {
          const altMatch = htmlContent.match(
            /"(https:\/\/[^"]*mediafire[^"]*\.(zip|rar|pdf|jpg|jpeg|png|gif|mp4|mp3|exe|apk|txt|doc|docx|xls|xlsx|ppt|pptx)[^"]*)"/i
          );
          if (altMatch) {
            link = altMatch[1];
          }
        }
      }
    } catch (directError) {
      console.log("Método directo falló, intentando método alternativo...");

      // MÉTODO 2: Usar proxy de traducción
      try {
        const translateUrl = `https://www-mediafire-com.translate.goog/${url.replace("https://www.mediafire.com/", "")}?_x_tr_sl=en&_x_tr_tl=es&_x_tr_hl=es&_x_tr_pto=wapp`;
        res = await axios.get(translateUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
          timeout: 30000,
        });

        $ = cheerio.load(res.data);
        const downloadButton = $("#downloadButton");
        link = downloadButton.attr("href");

        if (!link || link.includes("javascript:void(0)")) {
          const scrambledUrl = downloadButton.attr("data-scrambled-url");
          if (scrambledUrl) {
            try {
              link = Buffer.from(scrambledUrl, "base64").toString("utf8");
            } catch (e) {
              console.log(
                "Error decodificando URL cifrada en método alternativo"
              );
            }
          }
        }
      } catch (translateError) {
        console.log("Método alternativo también falló");
        throw new Error("No se pudo acceder al enlace de MediaFire");
      }
    }

    if (!link || link.includes("javascript:void(0)")) {
      throw new Error("No se pudo encontrar el enlace de descarga válido");
    }

    // Extraer información del archivo
    const name =
      $(
        "body > main > div.content > div.center > div > div.dl-btn-cont > div.dl-btn-labelWrap > div.promoDownloadName.notranslate > div"
      )
        .attr("title")
        ?.replace(/\s+/g, " ")
        ?.replace(/\n/g, "") ||
      $(".dl-btn-label").attr("title") ||
      $(".filename").text().trim() ||
      "archivo_descargado";

    const date =
      $(
        "body > main > div.content > div.center > div > div.dl-info > ul > li:nth-child(2) > span"
      )
        .text()
        .trim() ||
      $(".details li:nth-child(2) span").text().trim() ||
      "Fecha no disponible";

    const size =
      $("#downloadButton")
        .text()
        .replace("Download", "")
        .replace(/[()]/g, "")
        .replace(/\n/g, "")
        .replace(/\s+/g, " ")
        .trim() ||
      $(".details li:first-child span").text().trim() ||
      "Tamaño no disponible";

    // Determinar tipo MIME
    let mime = "";
    const ext = name.split(".").pop()?.toLowerCase();
    mime = lookup(ext) || "application/octet-stream";

    // Validar enlace final
    if (!link.startsWith("http")) {
      throw new Error("Enlace de descarga inválido");
    }

    return { name, size, date, mime, link };
  } catch (error) {
    console.error("Error en mediafireDl:", error.message);
    throw new Error(`Error al procesar MediaFire: ${error.message}`);
  }
}

handler.help = ["mediafire <url>", "mf <url>"];
handler.tags = ["descargas"];
handler.command = /^(mediafire|mf)$/i;
export default handler;
