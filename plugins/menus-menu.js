import { promises as fs } from "fs";
import { join } from "path";

const handler = async (m, { conn, usedPrefix, __dirname, isPrems }) => {
  try {
    const username = "@" + m.sender.split("@s.whatsapp.net")[0];
    if (usedPrefix == "a" || usedPrefix == "A") return;

    // Reacción del menú
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: "📱",
          key: m.key,
        },
      });
    } catch (reactError) {}

    const more = String.fromCharCode(8206);
    const readMore = more.repeat(4001);

    const d = new Date(new Date().getTime() + 3600000);

    let week, date;
    try {
      week = d.toLocaleDateString("es-ES", { weekday: "long" });
      date = d.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      week = "Desconocido";
      date = "Desconocido";
    }

    const _uptime = process.uptime() * 1000;
    const uptime = clockString(_uptime);
    const rtotal = Object.keys(global.db.data.users).length || "0";

    // Comandos organizados - SOLO DESCARGAS Y HERRAMIENTAS
    const extrasCommands = {
      descarga: [
        `${usedPrefix}play <busqueda> -- Descargar música`,
        `${usedPrefix}play2 <busqueda> -- Descargar video`,
        `${usedPrefix}ytmp3 <url> -- Audio de YouTube`,
        `${usedPrefix}ytmp3doc <url> -- Audio (documento)`,
        `${usedPrefix}ytmp4 <url> -- Video de YouTube`,
        `${usedPrefix}ytmp4doc <url> -- Video (documento)`,
        `${usedPrefix}facebook <url> -- Descargar de Facebook`,
        `${usedPrefix}instagram <url> -- Descargar de Instagram`,
        `${usedPrefix}tiktok <url> -- Descargar de TikTok`,
        `${usedPrefix}mediafire <url> -- Descargar de MediaFire`,
        `${usedPrefix}twitter <url> -- Descargar de Twitter`,
      ],
      herramientas: [
        `${usedPrefix}clima <lugar> -- Ver clima actual`,
        `${usedPrefix}del -- Eliminar mensajes del bot`,
        `${usedPrefix}sticker -- Crear sticker de imagen/video`,
        `${usedPrefix}toimg -- Convertir sticker a imagen`,
        `${usedPrefix}attp <texto> -- Texto colorido animado`,
        `${usedPrefix}readmore <texto1|texto2> -- Texto con "leer más"`,
      ],
    };

    const borderedTags = {
      descarga: "📥 DESCARGAS",
      herramientas: "🛠️ HERRAMIENTAS",
    };

    const help = Object.values(global.plugins)
      .filter((plugin) => !plugin.disabled)
      .map((plugin) => {
        return {
          help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
          tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
          prefix: "customPrefix" in plugin,
          limit: plugin.limit,
          enabled: !plugin.disabled,
        };
      });

    const menuSections = Object.keys(borderedTags)
      .map((tag) => {
        const commandsInTag = help
          .filter((menu) => menu.tags && menu.tags.includes(tag) && menu.help)
          .map((menu) => {
            return menu.help.map((h) => `${usedPrefix}` + h).join("\n");
          })
          .join("\n");

        const extraCommandsInTag = extrasCommands[tag]
          ? extrasCommands[tag].join("\n")
          : "";

        const allCommands = [commandsInTag, extraCommandsInTag]
          .filter(Boolean)
          .join("\n");

        if (allCommands) {
          return `
╭━━〔 ${borderedTags[tag]} 〕━━╮
┃
${allCommands
  .split("\n")
  .map((cmd) => `┃ ➡️ ${cmd}`)
  .join("\n")}
┃
╰━━━━━━━━━━━━━━━━━━━━╯
`.trim();
        }
        return "";
      })
      .filter((section) => section !== "");

    const infoBotSection = `
╭━━〔 ℹ️ INFORMACIÓN DEL BOT 〕━━╮
┃
┃ ➡️ Creador: ${global.author || "KARBOT-MD"}
┃ ➡️ Contacto: wa.me/${global.owner?.[0]?.[0] || "0"}
┃ ➡️ Tiempo activo: ${uptime}
┃ ➡️ Usuarios: ${rtotal}
┃ ➡️ Prefijo: ${usedPrefix}
┃
╰━━━━━━━━━━━━━━━━━━━━╯
`.trim();

    const mainHeader = `
╭━━〔 🔥 KARBOT-MD 🔥 〕━━╮
┃
┃ ➡️ Hola, ${username}
┃ ➡️ Fecha: ${week}, ${date}
┃ ➡️ Tu asistente de herramientas y descargas
┃
╰━━━━━━━━━━━━━━━━━━━━╯
`.trim();

    const fullText = [
      mainHeader,
      infoBotSection,
      ...menuSections,
      `💡 *Tip:* Usa ${usedPrefix}comando para más información de cada comando`,
    ].join("\n\n");

    const imageUrl = "https://qu.ax/DMtmw.jpg";

    await conn.sendMessage(
      m.chat,
      {
        image: { url: imageUrl },
        caption: fullText,
        mentions: [m.sender],
      },
      { quoted: m }
    );
  } catch (e) {
    console.error("Error en menú:", e);
    await m.reply("❌ *ERROR AL CARGAR EL MENÚ*\n\nIntenta nuevamente.");
  }
};

handler.help = ["menu"];
handler.tags = ["info"];
handler.command = /^(menu|help|comandos|commands|cmd|cmds)$/i;
export default handler;

function clockString(ms) {
  const h = isNaN(ms) ? "--" : Math.floor(ms / 3600000);
  const m = isNaN(ms) ? "--" : Math.floor(ms / 60000) % 60;
  const s = isNaN(ms) ? "--" : Math.floor(ms / 1000) % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, 0)).join(":");
}
