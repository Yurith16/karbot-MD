import os from "os";
import { performance } from "perf_hooks";

const handler = async (m, { conn, usedPrefix }) => {
  try {
    // Reacción inicial
    await conn.sendMessage(m.chat, {
      react: { text: '⏱️', key: m.key }
    });

    const start = Date.now();
    const ping = Date.now() - start;

    // Información del sistema
    const totalMemory = Math.round(os.totalmem() / (1024 * 1024 * 1024));
    const freeMemory = Math.round(os.freemem() / (1024 * 1024 * 1024));
    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercent = Math.round((usedMemory / totalMemory) * 100);

    const cpuUsage = os.loadavg()[0].toFixed(2);
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const uptimeString = `${hours}h ${minutes}m`;

    // Estado del ping
    let pingStatus = "";
    let pingEmoji = "🟢";

    if (ping < 100) {
      pingStatus = "Excelente";
      pingEmoji = "🟢";
    } else if (ping < 300) {
      pingStatus = "Bueno";
      pingEmoji = "🟡";
    } else if (ping < 600) {
      pingStatus = "Regular";
      pingEmoji = "🟠";
    } else {
      pingStatus = "Lento";
      pingEmoji = "🔴";
    }

    // Estado de la memoria
    let memoryStatus = "";
    let memoryEmoji = "🟢";

    if (memoryUsagePercent < 60) {
      memoryStatus = "Óptima";
      memoryEmoji = "🟢";
    } else if (memoryUsagePercent < 80) {
      memoryStatus = "Moderada";
      memoryEmoji = "🟡";
    } else if (memoryUsagePercent < 90) {
      memoryStatus = "Alta";
      memoryEmoji = "🟠";
    } else {
      memoryStatus = "Crítica";
      memoryEmoji = "🔴";
    }

    const responseMessage = `
*🤖 Karbot - Estado del sistema*

*📊 Conexión*
${pingEmoji} *Ping:* ${ping} ms (${pingStatus})
⏰ *Uptime:* ${uptimeString}

*💾 Memoria* ${memoryEmoji}
*Uso:* ${memoryUsagePercent}% (${memoryStatus})
*Total:* ${totalMemory}GB
*Libre:* ${freeMemory}GB

*⚙️ Sistema*
*CPU:* ${os.cpus().length} núcleos
*Plataforma:* ${os.platform()}
*Node.js:* ${process.version}

${ping < 300 && memoryUsagePercent < 80 ? '✅ Todo en orden' : '⚠️ Revisa el sistema'}
`;

    await conn.sendMessage(m.chat, {
      text: responseMessage
    }, { quoted: m });

    // Reacción final
    const finalReaction = memoryUsagePercent < 80 && ping < 300 ? '✅' : '⚠️';
    await conn.sendMessage(m.chat, {
      react: { text: finalReaction, key: m.key }
    });

  } catch (error) {
    console.error("Error en ping:", error);

    await conn.sendMessage(m.chat, {
      react: { text: '🚫', key: m.key }
    });

    await conn.sendMessage(m.chat, {
      text: "*🚫 Error del sistema*\n\n> ✦ *No se pudo obtener el estado del sistema*"
    }, { quoted: m });
  }
};

handler.command = /^(ping|info|status|estado|infobot|karbotstats)$/i;
export default handler;