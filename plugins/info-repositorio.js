const handler = async (m, { conn }) => {
  // MENSAJE SIMPLE Y DISCRETO
  const txt = `🔒 *REPOSITORIO PRIVADO*

▸ *Proyecto:* KARBOT-MD  
▸ *Desarrollador:* Hernandez
▸ *Estado:* Código no disponible

*Este es un proyecto privado. El código fuente no es accesible al público.*

📞 *Contacto:* +50496926150`.trim();

  await conn.sendMessage(m.chat, { 
    text: txt
  }, { quoted: m });
};

handler.command = ['script', 'repositorio', 'repo', 'codigo', 'github'];
export default handler;