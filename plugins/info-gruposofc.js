import fs from 'fs';

const handler = async (m, {conn, usedPrefix}) => {
  // MENSAJE SIMPLIFICADO CON SOLO TU GRUPO OFICIAL
  const text = `╭─「 🛡️ *GRUPO OFICIAL KARBOT-MD* 🛡️ 」
│
│ 🌟 *¡Únete a nuestra comunidad!*
│
│ 🔗 *Enlace oficial:*
│ https://chat.whatsapp.com/JeKUpOxymP4F6faK3B2Jqb
│
│ 📌 *Normas del grupo:*
│ ▸ Respetar a todos los miembros
│ ▸ No spam ni enlaces externos
│ ▸ Mantener temas relacionados al bot
│ ▸ Reportar problemas técnicos
│
│ ⚠️ *Este es el único grupo oficial*
│    de KARBOT-MD
│
╰─「 *KARBOT-MD - Soporte Comunitario* 」`.trim();

  // ENVÍO DE MENSAJE SIMPLE SIN ARCHIVOS ADJUNTOS
  conn.sendMessage(m.chat, {  
    text: text,
    contextInfo: {
      externalAdReply: {
        mediaType: 2,
        title: "🤖 KARBOT-MD - Grupo Oficial",
        body: "Únete a nuestra comunidad",
        sourceUrl: " "
      }
    }
  }, { quoted: m });
};

handler.command = ['linkgc', 'grupos', 'grupooficial', 'soporte'];
export default handler;