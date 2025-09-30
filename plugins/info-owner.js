/* Creador: HERNANDEZ */

const handler = async (m, { conn, usedPrefix }) => {
  // INFORMACIÓN DEL PROPIETARIO REDUCIDA
  const text = `╭─「 👑 *PROPIETARIO DE KARBOT-MD* 👑 」
│
│ 👤 *Nombre:* Hernandez
│ 📞 *Contacto:* +50496926150
│
╰─「 *KARBOT-MD* 」`.trim();

  // ENVÍO DE MENSAJE INFORMATIVO
  conn.sendMessage(m.chat, {
    text: text,
    contextInfo: {
      externalAdReply: {
        mediaType: 2,
        title: "👑 KARBOT-MD - Propietario",
        body: "Hernandez - Desarrollador Principal",
        sourceUrl: " "
      }
    }
  }, { quoted: m });
};

handler.help = ['owner', 'creador', 'desarrollador'];
handler.tags = ['info'];
handler.command = /^(owner|creator|creador|propietario|desarrollador|hernandez)$/i;

export default handler;