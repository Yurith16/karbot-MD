import os from 'os';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

async function getSystemInfo() {
  try {
    // INFORMACIÓN BÁSICA DEL SISTEMA
    const platform = os.platform();
    const arch = os.arch();
    const totalMem = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2);
    const freeMem = (os.freemem() / (1024 * 1024 * 1024)).toFixed(2);
    const uptime = Math.floor(os.uptime() / 3600); // horas

    // INFORMACIÓN DEL BOT
    const nodeVersion = process.version;
    const botUptime = Math.floor(process.uptime() / 3600); // horas

    const systemInfo = `╭─「 🖥️ *INFORMACIÓN DEL SISTEMA* 」
│
│ 🤖 *Bot:* KARBOT-MD
│ 👤 *Propietario:* Hernandez
│ 
│ 🔧 *Sistema Operativo:*
│ ▸ Plataforma: ${platform} ${arch}
│ ▸ Memoria Total: ${totalMem} GB
│ ▸ Memoria Libre: ${freeMem} GB
│ ▸ Uptime Sistema: ${uptime} horas
│
│ 🚀 *Información del Bot:*
│ ▸ Node.js: ${nodeVersion}
│ ▸ Uptime Bot: ${botUptime} horas
│ ▸ Versión: Privada
│
│ 📊 *Estado:*
│ ▸ Servidor: ✅ Activo
│ ▸ Conexión: ✅ Estable
│ ▸ Rendimiento: ✅ Optimizado
│
│ ⚠️ *Proyecto Privado:*
│   Información técnica limitada
│   por seguridad del sistema.
│
╰─「 *KARBOT-MD - Sistema Estable* 」`;

    return systemInfo;

  } catch (error) {
    // FALLBACK SIMPLE EN CASO DE ERROR
    return `🖥️ *INFORMACIÓN DEL SISTEMA*

🤖 KARBOT-MD - Sistema Privado
👤 Propietario: Hernandez

🔧 *Información básica:*
▸ Sistema: ${os.platform()} ${os.arch()}
▸ Node.js: ${process.version}
▸ Uptime: ${Math.floor(process.uptime() / 3600)}h

⚠️ *Proyecto privado - Info limitada*`;
  }
}

const handler = async (m, { conn }) => {
  try {
    // OBTENER INFORMACIÓN DEL SISTEMA
    const systemInfo = await getSystemInfo();
    
    // ENVIAR INFORMACIÓN (SIN CONTEXTO DE GITHUB)
    await conn.sendMessage(m.chat, { 
      text: systemInfo
    }, { quoted: m });

  } catch (error) {
    // MENSAJE DE ERROR SIMPLE
    await conn.sendMessage(m.chat, { 
      text: `❌ *Error al obtener información del sistema:*\n${error.message}`
    }, { quoted: m });
  }
};

handler.command = ['sysinfo', 'host', 'system', 'sistema'];
handler.help = ['sysinfo'];
handler.tags = ['info'];

export default handler;