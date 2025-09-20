const handler = async (m, {conn, usedPrefix}) => {
  // INFORMACIÓN DEL PROPIETARIO - KARBOT-MD
  const text = `╭─「 👑 *PROPIETARIO DE KARBOT-MD* 👑 」
│
│ 🤖 *Bot:* KARBOT-MD
│ 👤 *Creador y Desarrollador:* Hernandez
│ 📅 *Desde:* 2024
│ 🎯 *Tipo:* Proyecto Privado
│
│ 📞 *Contacto Directo:*
│ ➤ WhatsApp: +50496926150
│
│ 🤝 *Soporte Técnico:*
│ ➤ WhatsApp: +50489759545
│
│ 💼 *Disponibilidad:*
│ ▸ Soporte: Limitado
│ ▸ Consultas: Prioritarias
│ ▸ Colaboraciones: Evaluables
│
│ 🌟 *Acerca del Desarrollador:*
│ Desarrollador especializado en
│ bots de WhatsApp con Node.js
│ y sistemas automatizados.
│
│ ⚠️ *Importante:*
│ Este es un proyecto privado
│ sin fines de lucro.
│
│ 🔐 *Política de Contacto:*
│ ▸ No spam
│ ▸ Consultas técnicas específicas
│ ▸ Respeto mutuo
│ ▸ Horario razonable
│
╰─「 *KARBOT-MD - Proyecto de Hernandez* 」`.trim();

  // ENVÍO DE MENSAJE INFORMATIVO
  conn.sendMessage(m.chat, { 
    text: text,
    contextInfo: {
      externalAdReply: {
        mediaUrl: "https://github.com/Yurith16/karbot-MD",
        mediaType: 2,
        title: "👑 KARBOT-MD - Propietario",
        body: "Hernandez - Desarrollador Principal",
        sourceUrl: "https://github.com/Yurith16/karbot-MD"
      }
    }
  }, { quoted: m });
};

handler.help = ['owner', 'creador', 'desarrollador'];
handler.tags = ['info'];
handler.command = /^(owner|creator|creador|propietario|desarrollador|hernandez)$/i;

export default handler;