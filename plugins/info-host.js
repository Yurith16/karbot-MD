import fs from 'fs';
import os from 'os';
import { performance } from 'perf_hooks';

const handler = async (m, {conn, usedPrefix}) => {
  try {
    // INFORMACIÓN TÉCNICA DEL SISTEMA
    const platform = os.platform();
    const arch = os.arch();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const uptime = os.uptime();
    
    // Convertir memoria a GB
    const formatMemory = (bytes) => {
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    };
    
    // Convertir uptime a formato legible
    const formatUptime = (seconds) => {
      const days = Math.floor(seconds / (24 * 60 * 60));
      const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
      const mins = Math.floor((seconds % (60 * 60)) / 60);
      return `${days}d ${hours}h ${mins}m`;
    };

    // MENSAJE TÉCNICO DETALLADO
    const text = `╭─「 🐧 *INFORMACIÓN TÉCNICA - KARBOT-MD* 🖥️ 」
│
│ 🤖 *KARBOT-MD - Proyecto Privado*
│ 
│ 🔧 *Plataforma:* ${platform} ${arch}
│ 💾 *Memoria Total:* ${formatMemory(totalMem)}
│ 🆓 *Memoria Libre:* ${formatMemory(freeMem)}
│ ⏰ *Uptime Sistema:* ${formatUptime(uptime)}
│ 🚀 *Node.js:* ${process.version}
│
│ 📊 *Entornos soportados:*
│ ▸ Linux (Ubuntu/Debian) ✅
│ ▸ Termux (Android) ✅  
│ ▸ Windows Server ✅
│ ▸ MacOS ✅
│
│ 🛠️ *Tecnologías:*
│ ▸ Node.js + Baileys
│ ▸ MongoDB/JSON Database
│ ▸ Multi-dispositivo
│ ▸ Optimizado para CLI
│
│ 💼 *Patrocinadores:* 
│   Próximamente...
│
│ 🔍 *Monitorización:*
│ ▸ Uptime 24/7
│ ▸ Auto-reinicio
│ ▸ Logs detallados
│ ▸ Backup automático
│
│ 📞 *Soporte Técnico:*
│ ➤ Wa.me/50496926150 (Hernandez)
│
│ ⚠️ *Este es un proyecto privado*
│   hosteado en infraestructura dedicada
│
╰─「 *KARBOT-MD - Infraestructura Profesional* 」`.trim();

    // ENVÍO DE MENSAJE TÉCNICO
    conn.sendMessage(m.chat, { 
      text: text,
      contextInfo: {
        externalAdReply: {
          mediaUrl: "https://github.com/Yurith16/karbot-MD",
          mediaType: 2,
          title: "🐧 KARBOT-MD - Info Técnica",
          body: `Plataforma: ${platform} ${arch} | Node: ${process.version}`,
          sourceUrl: "https://github.com/Yurith16/karbot-MD"
        }
      }
    }, { quoted: m });
    
  } catch (error) {
    // FALLBACK EN CASO DE ERROR
    const fallbackText = `╭─「 🖥️ *INFORMACIÓN TÉCNICA* 」
│
│ 🤖 *KARBOT-MD - Proyecto Privado*
│ 
│ 🔧 *Plataforma:* Linux/Termux
│ 🚀 *Node.js:* ${process.version}
│ 📊 *Entornos:* Linux, Termux, Windows, MacOS
│
│ 🛠️ *Tecnologías:* Node.js + Baileys
│ 💼 *Patrocinadores:* Próximamente...
│ 📞 *Soporte:* Wa.me/50496926150
│
╰─「 *KARBOT-MD - Infraestructura* 」`;
    
    conn.sendMessage(m.chat, { text: fallbackText }, { quoted: m });
  }
}; 

handler.command = ['host', 'hosting', 'servidor', 'infraestructura', 'tecnico', 'system'];
export default handler;