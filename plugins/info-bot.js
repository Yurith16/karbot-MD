import fs from 'fs';
const handler = (m) => m;
handler.all = async function(m) {
  const chat = global.db.data.chats[m.chat];
  if (/^bot$/i.test(m.text) && !chat.isBanned) {
    m.conn.sendPresenceUpdate('recording', m.chat);
    // MENSAJE ACTUALIZADO PARA KARBOT-MD
    await m.reply(`*¡Hola! Soy KARBOT-MD, tu asistente virtual. ¿En qué puedo ayudarte?*`);
    
  }
  return !0;
};
export default handler;
