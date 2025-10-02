import axios from 'axios';
import * as cheerio from 'cheerio';

let handler = async (m, { args, conn, text, usedPrefix, command }) => {
  // Sistema de reacción - Indicar que el comando fue detectado
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

  if (!text) throw `_*📱 DESCARGADOR DE FACEBOOK*_\n\n*🚫 Uso incorrecto:*\n\n*💡 Ejemplo:* ${usedPrefix + command} https://www.facebook.com/share/v/1E5R3gRuHk/`;

    const platform = 'facebook';
    // Admite: ('tiktok' & 'instagram')

    try {
        // Cambiar reacción a "procesando"
        await conn.sendMessage(m.chat, { react: { text: '📥', key: m.key } });

        const links = await fetchDownloadLinks(text, platform, conn, m);
        if (!links) return;

        if (links.length === 0) {
          await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
          return await conn.sendMessage(m.chat, { text: '*[ ❌ ] No se encontraron enlaces de descarga.*' }, { quoted: m });
        }

        let download = getDownloadLink(platform, links);

        if (!download) {
          await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
          return await conn.sendMessage(m.chat, { text: '*[ ❌ ] Error al obtener el enlace de descarga.*' }, { quoted: m });
        }

        if (Array.isArray(download)) {
            for (const media of download) {
                try {
                    await conn.sendMessage(m.chat, { image: { url: media }, caption: `*[📥] Instagram Downloader*\n${media}` }, { quoted: m });
                } catch (err) {
                    console.log(`Error enviando ${media}:`, err.message);
                }
            }
        } else {
            try {
                const ext = download.includes('.mp4') ? 'mp4' : 'jpg';
                const caption = `*📥 Descarga de ${platform} exitosa!*`;

                // Reacción de éxito
                await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

                if (ext === 'mp4') {
                    await conn.sendMessage(m.chat, { video: { url: download }, caption: caption }, { quoted: m });
                } else {
                    await conn.sendMessage(m.chat, { image: { url: download }, caption: caption }, { quoted: m });
                }
            } catch (err) {
              await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
              return await conn.sendMessage(m.chat, { text: `*[❌] Error al enviar el archivo:* ${err.message}` }, { quoted: m });
            }
        }

    } catch (error) {
        // Reacción de error
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        console.log('Error en downloader:', error);
        return await conn.sendMessage(m.chat, { text: `*[❌] Ocurrió un error:*\n${error.message || error}` }, { quoted: m });
    }
};

handler.command = /^(facebook|fb|facebookdl|fbdl|facebook2|fb2|facebookdl2|fbdl2|facebook3|fb3|facebookdl3|fbdl3|facebook4|fb4|facebookdl4|fbdl4|facebook5|fb5|facebookdl5|fbdl5)$/i;
handler.tags = ['downloader'];
handler.help = ['facebook'];
export default handler;

async function fetchDownloadLinks(text, platform, conn, m) {
    const { SITE_URL, form } = createApiRequest(text, platform);

    const res = await axios.post(`${SITE_URL}api`, form.toString(), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Origin': SITE_URL,
            'Referer': SITE_URL,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'X-Requested-With': 'XMLHttpRequest'
        }
    });

    const html = res?.data?.html;

    if (!html || res?.data?.status !== 'success') {
        await conn.sendMessage(m.chat, { text: '*[❌] Error al obtener datos del servidor.*' }, { quoted: m });
        return null;
    }

    const $ = cheerio.load(html);
    const links = [];

    $('a.btn[href^="http"]').each((_, el) => {
        const link = $(el).attr('href');
        if (link && !links.includes(link)) {
            links.push(link);
        }
    });

    return links;
}

function createApiRequest(text, platform) {
    const SITE_URL = 'https://instatiktok.com/';
    const form = new URLSearchParams();
    form.append('url', text);
    form.append('platform', platform);
    form.append('siteurl', SITE_URL);
    return { SITE_URL, form };
}

function getDownloadLink(platform, links) {
    if (platform === 'instagram') {
        return links;
    } else if (platform === 'tiktok') {
        return links.find(link => /hdplay/.test(link)) || links[0];
    } else if (platform === 'facebook') {
        return links.at(-1);
    }
    return null;
}