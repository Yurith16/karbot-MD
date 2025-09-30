/* ⚠ COMANDO DE INFORMACIÓN - KARBOT-MD ⚠ */

const handler = async (m, { conn, usedPrefix, command }) => {
  try {    
    // MENSAJE SIMPLIFICADO PARA PROYECTO PRIVADO
    const infoMsg = `╭─「 🤖 *KARBOT-MD* 🤖 」
│
│ ¡Hola *${m?.name}*! 👋
│
│ ▸ *Proyecto privado* 🔒
│ ▸ *Creado por:* Hernandez
│ ▸ *Versión:* Privada
│
│ 📧 *Contacto del desarrollador:*
│ ➤ Wa.me/50496926150
│
│ 💬 *Soporte técnico:*
│ ➤ Wa.me/50489759545
│
│ ⚠ *Este es un proyecto privado*
│    sin fines de lucro.
│
╰─「 *¡Gracias por usar KARBOT-MD!* 🙏 」`.trim();

    // ENVÍO DE MENSAJE SIMPLE SIN ARCHIVOS ADJUNTOS
    conn.sendMessage(m.chat, {    
      text: infoMsg,
      contextInfo: {
        mentionedJid: conn.parseMention(infoMsg),
        externalAdReply: {
          mediaType: 2,
          title: '🤖 KARBOT-MD - Proyecto Privado',
          body: 'KARBOT-MD | Asistente de WhatsApp',
          sourceUrl: ' '
        }
      }
    }, { quoted: m });

  } catch {
    // MENSAJE DE FALLBACK SIMPLIFICADO
    const simpleMsg = `🤖 *KARBOT-MD* - Proyecto Privado

¡Hola *${m?.name}*!  

▸ *Desarrollador:* Hernandez
▸ *Contacto:* Wa.me/50496926150
▸ *Soporte:* Wa.me/50489759545

⚡ *Bot de uso privado*
🔒 *Sin fines de lucro*

¡Gracias por usar KARBOT-MD! 🙏`;

    m.reply(simpleMsg);
  }
};
handler.help = ['info'];
handler.tags = ['info'];
handler.command = /^(info|informacion|creditos|acerca|karbot|bot)$/i
export default handler;