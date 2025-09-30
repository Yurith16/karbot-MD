const handler = async (m, { conn }) => {
  // TÉRMINOS Y CONDICIONES - KARBOT-MD
  const terminos = `╭─「 📜 *TÉRMINOS Y CONDICIONES* 📜 」
│
│ 🤖 *KARBOT-MD - PROYECTO PRIVADO*
│ 👤 *Propietario:* Hernandez
│
│ 🔒 *1. USO DEL BOT*
│ ▸ Este bot es de uso privado
│ ▸ No está disponible para el público
│ ▸ El acceso es por invitación
│
│ 📝 *2. PRIVACIDAD DE DATOS*
│ ▸ No almacenamos mensajes personales
│ ▸ Los datos se usan solo para funcionalidad del bot
│ ▸ No compartimos información con terceros
│
│ ⚠️ *3. PROHIBICIONES*
│ ▸ No usar para spam o actividades maliciosas
│ ▸ No reverse engineering del código
│ ▸ No redistribución no autorizada
│
│ 🔧 *4. SOPORTE TÉCNICO*
│ ▸ Soporte limitado a usuarios autorizados
│ ▸ Horarios de atención: Flexible
│ ▸ Contacto: +50496926150
│
│ 📞 *5. CONTACTO Y REPORTES*
│ ▸ Reportar problemas técnicos
│ ▸ Sugerencias de funcionalidad
│ ▸ Consultas sobre uso autorizado
│
│ ⚖️ *6. LIMITACIÓN DE RESPONSABILIDAD*
│ ▸ Uso bajo responsabilidad del usuario
│ ▸ No nos hacemos responsables por mal uso
│ ▸ El bot se provee "tal cual"
│
│ 🛡️ *7. PROPIEDAD INTELECTUAL*
│ ▸ KARBOT-MD es marca registrada
│ ▸ Código fuente: Propiedad de Hernandez
│ ▸ Prohibida la reproducción no autorizada
│
│ 📅 *8. ACTUALIZACIONES*
│ ▸ Términos sujetos a cambios
│ ▸ Se notificarán actualizaciones
│ ▸ Vigencia desde: Enero 2024
│
╰─「 *Al usar este bot, aceptas estos términos* 」`;

  conn.sendMessage(m.chat, { text: terminos }, { quoted: m });
};

handler.help = ['tyc', 'terminos', 'privacidad'];
handler.tags = ['info'];
handler.command = /^(terminosycondicionesyprivacidad|terminosycondiciones|tyc|t&c|privacidad|terminos)$/i;

export default handler;