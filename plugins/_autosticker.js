import { sticker } from '../src/libraries/sticker.js';

const handler = (m) => m;

handler.all = async function(m) {
  const chat = global.db.data.chats[m.chat];
  
  // Verificar si autosticker está activado y es un grupo
  if (chat.autosticker && m.isGroup) {
    const q = m;
    let stiker = false;
    const mime = (q.msg || q).mimetype || q.mediaType || '';
    
    // Ignorar si ya es un sticker webp
    if (/webp/g.test(mime)) return;
    
    // Procesar imágenes
    if (/image/g.test(mime)) {
      const img = await q.download?.();
      if (!img) return;
      stiker = await sticker(img, false, global.packname, global.author);
    } 
    // Procesar videos (máximo 8 segundos)
    else if (/video/g.test(mime)) {
      if ((q.msg || q).seconds > 8) {
        // Mensaje breve si el video es muy largo
        await this.sendMessage(m.chat, { 
          text: `⚠️ *Vídeo demasiado largo*\n\nSolo se convierten videos de hasta 8 segundos.` 
        }, { quoted: m });
        return;
      }
      const img = await q.download();
      if (!img) return;
      stiker = await sticker(img, false, global.packname, global.author);
    } 
    // Procesar URLs de imágenes
    else if (m.text && isUrl(m.text)) {
      stiker = await sticker(false, m.text.split(/\n| /i)[0], global.packname, global.author);
    } else {
      return;
    }
    
    // Enviar sticker si se creó correctamente
    if (stiker) {
      await this.sendFile(m.chat, stiker, null, { asSticker: true });
      
      // Mensaje breve de confirmación
      await this.sendMessage(m.chat, { 
        text: `✅ *Sticker creado automáticamente*\n\nFunción auto-sticker activada.` 
      }, { quoted: m });
    }
  }
  
  return true;
};

export default handler;

// Función para detectar URLs de imágenes/videos
const isUrl = (text) => {
  return text.match(new RegExp(/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png|mp4)/, 'gi'));
};