const handler = (m) => m;

handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner, isROwner }) {
  if (!m.isGroup) return false;
  
  const chat = global.db.data.chats[m.chat];
  const botSettings = global.db.data.settings[conn.user.jid] || {};
  
  // Verificar si la función anti-arab está activada y tenemos permisos
  if (isBotAdmin && chat.antiArab2 && !isAdmin && !isOwner && !isROwner && botSettings.restrict) {
    
    const userNumber = m.sender.split('@')[0];
    
    // Sistema de detección de códigos de país
    const detectedCountries = [];
    
    if (userNumber.startsWith('212')) { // Marruecos
      detectedCountries.push('Marruecos (+212)');
    }
    if (userNumber.startsWith('265')) { // Malawi
      detectedCountries.push('Malawi (+265)');
    }
    if (userNumber.startsWith('92')) {  // Pakistán
      detectedCountries.push('Pakistán (+92)');
    }
    if (userNumber.startsWith('234')) { // Nigeria
      detectedCountries.push('Nigeria (+234)');
    }
    
    // Si se detectó algún código de país restringido
    if (detectedCountries.length > 0) {
      const userMention = `@${m.sender.split('@')[0]}`;
      
      // Mensaje de expulsión personalizado
      const kickMessage = `╭─「 🚫 *PROTECCIÓN ACTIVADA* 🚫 」
│
│ 🤖 *KARBOT-MD - Sistema de Seguridad*
│ 
│ 👤 *Usuario detectado:* ${userMention}
│ 🌍 *Región restringida:* ${detectedCountries.join(', ')}
│ 
│ 🔒 *Acción tomada:* Expulsión automática
│ 
│ ⚠️ *Motivo:* Prevención de spam y seguridad
│ 
│ 📋 *Política del grupo:* 
│   Solo se permiten miembros de
│   regiones autorizadas.
│
╰─「 *KARBOT-MD - Protegiendo tu grupo* 」`;
      
      // Enviar mensaje de advertencia
      await conn.sendMessage(m.chat, { 
        text: kickMessage,
        mentions: [m.sender]
      }, { quoted: m });
      
      // Expulsar al usuario
      try {
        const response = await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
        if (response[0].status === '404') {
          console.log('Usuario no encontrado en el grupo');
        }
      } catch (error) {
        console.error('Error al expulsar usuario:', error);
      }
    }
  }
};

export default handler;