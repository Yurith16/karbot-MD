import fs from 'fs';
const handler = (m) => m;
handler.all = async function(m) {
  // ELIMINAR AUDIO DEL DUEÑO ANTERIOR (NO EXISTIRÁ)
  // const vn = './src/assets/audio/01J67301CY64MEGCXYP1NRFPF1.mp3';
  const chat = global.db.data.chats[m.chat];
  if (/^bot$/i.test(m.text) && !chat.isBanned) {
    m.conn.sendPresenceUpdate('recording', m.chat);
    // MENSAJE ACTUALIZADO PARA KARBOT-MD
    await m.reply(`*¡Hola! Soy KARBOT-MD, tu asistente virtual. ¿En qué puedo ayudarte?*`);
    
    // ELIMINAR ENVÍO DE AUDIO (COMENTADO PORQUE EL ARCHIVO NO EXISTE)
    // m.conn.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mpeg', ptt: true}, {quoted: m});
  }
  return !0;
};
export default handler;

// ELIMINADO CÓDIGO COMENTADO CON DATOS DEL ANTERIOR PROPIETARIO
// (Contenía números de WhatsApp, nombres de bot y referencia a imagen que no existe)