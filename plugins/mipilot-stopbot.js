import fs from "fs"

async function handler(m, {conn, usedPrefix}) {
   if (conn.user.jid == global.conn.user.jid) {
     // Reacción de error
     try {
       await conn.sendMessage(m.chat, {
         react: {
           text: '❌',
           key: m.key
         }
       });
     } catch (reactError) {}
     return m.reply('❌ *NO PUEDES DETENER EL BOT PRINCIPAL*')
   }

   // Reacción de despedida
   try {
     await conn.sendMessage(m.chat, {
       react: {
         text: '👋',
         key: m.key
       }
     });
   } catch (reactError) {}

   m.reply('👋 *SESIÓN DETENIDA*\n\nEl bot secundario se ha desconectado correctamente.')
   conn.fstop = true
   conn.ws.close()
}
handler.command = handler.help = ['stop', 'byebot', 'detenerbot'];
handler.tags = ['jadibot'];
handler.owner = true
export default handler;