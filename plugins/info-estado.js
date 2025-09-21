import { generateWAMessageFromContent } from "baileys";
import os from "os";
import util from "util";
import sizeFormatter from "human-readable";
import fs from "fs";
import { performance } from "perf_hooks";

const handler = async (m, { conn, usedPrefix }) => {
  const _uptime = process.uptime() * 1000;
  const uptime = clockString(_uptime);
  const totalusrReg = Object.values(global.db.data.users).filter((user) => user.registered == true).length;
  const totalusr = Object.keys(global.db.data.users).length;
  const chats = Object.entries(conn.chats).filter(
    ([id, data]) => id && data.isChats
  );
  const groupsIn = chats.filter(([id]) => id.endsWith("@g.us"));
  const groups = chats.filter(([id]) => id.endsWith("@g.us"));
  const used = process.memoryUsage();
  const { restrict, antiCall, antiprivado, modejadibot } =
    global.db.data.settings[conn.user.jid] || {};
  const { autoread, gconly, pconly, self } = global.opts || {};
  const old = performance.now();
  const neww = performance.now();
  const rtime = (neww - old).toFixed(7);
  const wm = 'KARBOT-MD';

  // INFORMACIÓN ACTUALIZADA
  const info = `╭─「 📊 *ESTADO DE KARBOT-MD* 📊 」
│
│ 🤖 *Bot:* KARBOT-MD
│ 👤 *Creador:* Hernandez
│ 📞 *Soporte:* +50489759545
│
│ ⚡ *Rendimiento:* ${rtime}
│ 🕐 *Uptime:* ${uptime}
│ 🔧 *Prefijo:* ${usedPrefix}
│ 🌐 *Modo:* ${self ? "privado" : "público"}
│
│ 👥 *Usuarios registrados:* ${totalusrReg}
│ 👥 *Total usuarios:* ${totalusr}
│ ${(conn.user.jid == global.conn.user.jid ? '' : `│ 🤖 Sub-bot de:\n│ ▢ +${global.conn.user.jid.split('@')[0]}`) || '│ 🤖 No es sub-bot'}
│
│ 💬 *Chats privados:* ${chats.length - groups.length}
│ 👥 *Grupos:* ${groups.length}
│ 📊 *Total chats:* ${chats.length}
│
│ ⚙️ *Configuraciones:*
│ ▸ Auto-leer: ${autoread ? "✅" : "❌"}
│ ▸ Restrict: ${restrict ? "✅" : "❌"}
│ ▸ Solo PC: ${pconly ? "✅" : "❌"}
│ ▸ Solo grupos: ${gconly ? "✅" : "❌"}
│ ▸ Anti-privado: ${antiprivado ? "✅" : "❌"}
│ ▸ Anti-llamadas: ${antiCall ? "✅" : "❌"}
│ ▸ Mode jadibot: ${modejadibot ? "✅" : "❌"}
╰─「 *KARBOT-MD - Proyecto Privado* 」`.trim();

  // ENVÍO DE MENSAJE SIMPLE DE TEXTO
  conn.sendMessage(m.chat, {  
    text: info,
    contextInfo: {
      externalAdReply: {
        mediaType: 2,
        title: "🤖 KARBOT-MD - Estado del Sistema",
        body: "Estado y estadísticas del bot",
        sourceUrl: " "
      }
    }
  }, { quoted: m });
};

handler.command = /^(ping|info|status|estado|infobot|karbotstats)$/i;
export default handler;

function clockString(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  console.log({ ms, h, m, s });
  return [h, m, s].map((v) => v.toString().padStart(2, 0)).join(":");
}