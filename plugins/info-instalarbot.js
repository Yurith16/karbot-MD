const handler = async (m, {conn, usedPrefix}) => {
  // MENSAJE CLARO SOBRE INSTALACIONES
  const text = `╭─「 🚧 *INSTALACIÓN DE KARBOT-MD* 🚧 」
│
│ 🤖 *KARBOT-MD - Proyecto Privado*
│ 
│ ⚠️ *Estado actual:* 
│   Instalaciones reservadas
│
│ 📋 *Motivo:*
│   El bot se encuentra en etapa
│   activa de desarrollo y corrección
│   de errores.
│
│ 🔧 *Proceso actual:*
│   ▸ Optimización de código
│   ▸ Corrección de bugs
│   ▸ Implementación de features
│   ▸ Pruebas de estabilidad
│
│ 🎯 *Próximamente:*
│   Cuando el proyecto esté estable
│   se evaluará la posibilidad de
│   compartir el código fuente.
│
│ 💡 *Para desarrolladores:*
│   Si estás interesado en colaborar
│   o recibir actualizaciones sobre
│   el estado del proyecto:
│
│ 📞 *Contacto:* 
│   Wa.me/50496926150 (Hernandez)
│
│ ⚠️ *Este es un proyecto privado*
│   sin instalaciones públicas disponibles
│   por el momento.
│
╰─「 *KARBOT-MD - En Desarrollo* 」`.trim();

  // ENVÍO DE MENSAJE INFORMATIVO
  conn.sendMessage(m.chat, { 
    text: text,
    contextInfo: {
      externalAdReply: {
        mediaUrl: "https://github.com/Yurith16/karbot-MD",
        mediaType: 2,
        title: "🚧 KARBOT-MD - Instalación",
        body: "Proyecto en desarrollo - Instalaciones reservadas",
        sourceUrl: "https://github.com/Yurith16/karbot-MD"
      }
    }
  }, { quoted: m });
};

handler.command = ['instalarbot', 'installbot', 'setupbot', 'codigofuente'];
export default handler;