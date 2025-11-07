import axios from 'axios';
import crypto from 'crypto';

// Scraper savetube para descargas de audio
const savetube = {
   api: {
      base: "https://media.savetube.me/api",
      cdn: "/random-cdn",
      info: "/v2/info",
      download: "/download"
   },
   headers: {
      'accept': '*/*',
      'content-type': 'application/json',
      'origin': 'https://yt.savetube.me',
      'referer': 'https://yt.savetube.me/',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
   },
   crypto: {
      hexToBuffer: (hexString) => {
         const matches = hexString.match(/.{1,2}/g);
         return Buffer.from(matches.map(byte => parseInt(byte, 16)));
      },
      decrypt: async (enc) => {
         try {
            const secretKey = 'C5D58EF67A7584E4A29F6C35BBC4EB12';
            const data = Buffer.from(enc, 'base64');
            const iv = data.slice(0, 16);
            const content = data.slice(16);
            const key = savetube.crypto.hexToBuffer(secretKey);
            const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
            let decrypted = decipher.update(content);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return JSON.parse(decrypted.toString());
         } catch (error) {
            console.error('Error decrypting:', error);
            throw new Error(`Decryption failed: ${error.message}`);
         }
      }
   },
   youtube: url => {
      if (!url) return null;
      const patterns = [
         /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
         /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
         /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
         /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
         /youtu\.be\/([a-zA-Z0-9_-]{11})/
      ];
      for (let pattern of patterns) {
         if (pattern.test(url)) return url.match(pattern)[1];
      }
      return null;
   },
   request: async (endpoint, data = {}, method = 'post') => {
      try {
         const url = endpoint.startsWith('http') ? endpoint : `${savetube.api.base}${endpoint}`;
         console.log(`Making request to: ${url}`);
         
         const config = {
            method,
            url,
            headers: savetube.headers,
            timeout: 30000
         };

         if (method === 'post') {
            config.data = data;
         } else {
            config.params = data;
         }

         const response = await axios(config);
         return {
            status: true,
            code: 200,
            data: response.data
         };
      } catch (error) {
         console.error('Request error:', error.message);
         return {
            status: false,
            code: error.response?.status || 500,
            error: error.message
         };
      }
   },
   getCDN: async () => {
      try {
         const response = await savetube.request(savetube.api.cdn, {}, 'get');
         if (!response.status) throw new Error(response.error);
         return {
            status: true,
            code: 200,
            data: response.data.cdn
         };
      } catch (error) {
         console.error('CDN error:', error);
         return {
            status: false,
            code: 500,
            error: error.message
         };
      }
   },
   downloadAudio: async (link) => {
      if (!link) {
         return {
            status: false,
            code: 400,
            error: "No link provided."
         };
      }
      
      const id = savetube.youtube(link);
      if (!id) {
         return {
            status: false,
            code: 400,
            error: "Invalid YouTube link."
         };
      }

      try {
         console.log(`Processing YouTube video ID: ${id}`);
         
         const cdnx = await savetube.getCDN();
         if (!cdnx.status) return cdnx;
         
         const cdn = cdnx.data;
         console.log(`Using CDN: ${cdn}`);
         
         const result = await savetube.request(`https://${cdn}${savetube.api.info}`, {
            url: `https://www.youtube.com/watch?v=${id}`
         });
         
         if (!result.status) return result;
         if (!result.data?.data) {
            return {
               status: false,
               code: 500,
               error: "No data received from API"
            };
         }

         const decrypted = await savetube.crypto.decrypt(result.data.data);
         console.log('Decrypted data:', decrypted);

         const dl = await savetube.request(`https://${cdn}${savetube.api.download}`, {
            id: id,
            downloadType: 'audio',
            quality: '128',
            key: decrypted.key
         });

         if (!dl.status || !dl.data?.data?.downloadUrl) {
            return {
               status: false,
               code: 500,
               error: "Failed to get download URL"
            };
         }

         return {
            status: true,
            code: 200,
            result: {
               title: decrypted.title || "Unknown Title",
               type: 'audio',
               format: 'mp3',
               thumbnail: decrypted.thumbnail || `https://i.ytimg.com/vi/${id}/0.jpg`,
               download: dl.data.data.downloadUrl,
               id: id,
               key: decrypted.key,
               duration: decrypted.duration,
               quality: '128'
            }
         };
      } catch (error) {
         console.error('Download audio error:', error);
         return {
            status: false,
            code: 500,
            error: error.message
         };
      }
   }
};

let handler = async (m, { args, conn, text, usedPrefix, command }) => {
  try {
    if (!text) {
      await conn.sendMessage(m.chat, {
        text: `❀ Ingresa un texto para buscar en YouTube.\n> *Ejemplo:* ${usedPrefix + command} Shakira`
      }, { quoted: m });
      return;
    }

    console.log(`Searching for: ${text}`);
    
    const searchApi = `https://delirius-apiofc.vercel.app/search/ytsearch?q=${encodeURIComponent(text)}`;
    const searchResponse = await axios.get(searchApi, { timeout: 10000 });
    const searchData = searchResponse.data;

    if (!searchData?.data || searchData.data.length === 0) {
      await conn.sendMessage(m.chat, {
        text: `⚠️ No se encontraron resultados para "${text}".`
      }, { quoted: m });
      return;
    }

    const video = searchData.data[0];
    console.log(`Found video: ${video.title}`);

    const videoDetails =
      ` *「✦」 ${video.title}*\n\n` +
      `> ✦ *Canal:* » ${video.author?.name || 'Desconocido'}\n` +
      `> ⴵ *Duración:* » ${video.duration || 'Desconocida'}\n` +
      `> ✰ *Vistas:* » ${video.views || 'Desconocidas'}\n` +
      `> ✐ *Publicado:* » ${video.publishedAt || 'Desconocida'}\n` +
      `> 🜸 *Enlace:* » ${video.url}`;

    // Enviar información del video
    await conn.sendMessage(m.chat, {
      image: { url: video.image || video.thumbnail },
      caption: videoDetails.trim()
    }, { quoted: m });

    // Procesar descarga de audio
    console.log(`Starting audio download for: ${video.url}`);
    const downloadResult = await savetube.downloadAudio(video.url);

    if (!downloadResult.status) {
      console.error('Download failed:', downloadResult.error);
      await conn.sendMessage(m.chat, {
        text: `❌ Error al descargar el audio: ${downloadResult.error || 'Error desconocido'}`
      }, { quoted: m });
      return;
    }

    console.log('Download successful, sending audio...');
    
    // Enviar audio
    await conn.sendMessage(m.chat, {
      audio: { 
        url: downloadResult.result.download 
      },
      mimetype: "audio/mpeg",
      fileName: `${video.title.substring(0, 50)}.mp3`.replace(/[^\w\s.-]/gi, ''),
      caption: `🎵 *${video.title}*`
    }, { quoted: m });

    // Reacción de éxito
    await conn.sendMessage(m.chat, {
      react: { text: "✅", key: m.key }
    });

  } catch (error) {
    console.error('Handler error:', error);
    await conn.sendMessage(m.chat, {
      text: `❌ Error al procesar la solicitud:\n${error.message || 'Error desconocido'}`
    }, { quoted: m });
  }
};

handler.command = /^(play|audio|mp|ytmp3)$/i;
handler.tags = ['media'];
handler.help = ['play <texto>', 'audio <texto>', 'mp3 <texto>', 'ytmp3 <texto>'];
export default handler;