/* Desarrollado y Creado por: HERNANDEZ - KARBOT-MD */

import axios from 'axios';
import * as cheerio from 'cheerio';

let handler = async (m, { args, conn, text, usedPrefix, command }) => {
    // Sistema de reacción - Indicar que el comando fue detectado
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    if (!text) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        throw `*📱 DESCARGADOR DE FACEBOOK*\n\n*🚫 Uso incorrecto:*\n*${usedPrefix + command} <url_de_facebook>*\n\n*💡 Ejemplos:*\n*${usedPrefix + command}* https://facebook.com/watch?v=123456\n*${usedPrefix + command}* https://fb.watch/abc123\n*${usedPrefix + command}* https://facebook.com/share/v/12DoEUCoFji/`;
    }

    // Validar URL de Facebook
    if (!isValidFacebookUrl(text)) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        throw `*❌ URL NO RECONOCIDA*\n\nEl enlace proporcionado no parece ser de Facebook. Por favor, asegúrate de que sea un enlace válido de un video.`;
    }

    try {
        // Cambiar reacción a "procesando"
        await conn.sendMessage(m.chat, { react: { text: '📥', key: m.key } });

        // Intentar con múltiples APIs en orden
        let videoData = null;
        let apiUsed = '';

        // API 1: Dorratz API (Primaria)
        try {
            const response = await axios.get(`https://api.dorratz.com/fbvideo?url=${encodeURIComponent(text)}`, {
                timeout: 15000
            });
            if (response.data && response.data.url) {
                videoData = response.data;
                apiUsed = 'API Dorratz';
            }
        } catch (error) {
            console.log('API Dorratz falló, intentando siguiente...');
        }

        // API 2: Dorratz API V2 (Secundaria)
        if (!videoData) {
            try {
                const response = await axios.get(`https://api.dorratz.com/v3/fb2?url=${encodeURIComponent(text)}`, {
                    timeout: 15000
                });
                if (response.data && response.data.url) {
                    videoData = response.data;
                    apiUsed = 'API Dorratz V2';
                }
            } catch (error) {
                console.log('API Dorratz V2 falló, intentando siguiente...');
            }
        }

        // API 3: InstaTikTok Scraper (Respaldo)
        if (!videoData) {
            try {
                const links = await fetchDownloadLinks(text, 'facebook', conn, m);
                if (links && links.length > 0) {
                    const downloadUrl = links.at(-1);
                    if (downloadUrl) {
                        videoData = { url: downloadUrl, quality: 'HD', api: 'InstaTikTok' };
                        apiUsed = 'Scraper InstaTikTok';
                    }
                }
            } catch (error) {
                console.log('Scraper InstaTikTok falló...');
            }
        }

        // API 4: API alternativa (Último recurso)
        if (!videoData) {
            try {
                const response = await axios.get(`https://api.xcteam.xyz/api/downloader/facebook?url=${encodeURIComponent(text)}`, {
                    timeout: 15000
                });
                if (response.data && response.data.result && response.data.result.hd) {
                    videoData = { url: response.data.result.hd, quality: 'HD', api: 'XC Team' };
                    apiUsed = 'API XC Team';
                }
            } catch (error) {
                console.log('API XC Team falló...');
            }
        }

        if (!videoData || !videoData.url) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            throw `*❌ ERROR AL DESCARGAR*\n\nNo se pudo obtener el video. Posibles causas:\n• El video es privado\n• El enlace ha expirado\n• El video fue eliminado\n• Límite de reproducciones alcanzado`;
        }

        const videoUrl = videoData.url;
        const quality = videoData.quality || videoData.resolution || 'Calidad disponible';
        const caption = `*✅ DESCARGADO DE FACEBOOK*\n\n*📊 Calidad:* ${quality}\n*🔧 API usada:* ${apiUsed}\n*⬇️ Enviando video...*`;

        // Reacción de éxito
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        // Enviar el video
        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            mimetype: 'video/mp4',
            caption: caption
        }, { quoted: m });

    } catch (error) {
        // Reacción de error
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        console.log('Error en facebook downloader:', error);

        let errorMessage = `*❌ ERROR AL PROCESAR*\n\n`;
        if (error.message.includes('timeout')) {
            errorMessage += `*⏰ Tiempo de espera agotado.* Los servidores están saturados.`;
        } else if (error.message.includes('404')) {
            errorMessage += `*🔍 Video no encontrado.* Puede haber sido eliminado o ser privado.`;
        } else {
            errorMessage += `*💻 Error técnico:* ${error.message}`;
        }

        errorMessage += `\n\n*💡 Intenta con otro enlace o verifica que el video sea público.*`;

        await conn.reply(m.chat, errorMessage, m);
    }
};

// Función para validar URL de Facebook (MEJORADA)
function isValidFacebookUrl(url) {
    const facebookPatterns = [
        /https?:\/\/(www\.|m\.)?facebook\.com\/.*\/videos\/\d+/i,
        /https?:\/\/(www\.|m\.)?facebook\.com\/.*\/video\.php\?v=\d+/i,
        /https?:\/\/(www\.|m\.)?facebook\.com\/watch\/?\?v=\d+/i,
        /https?:\/\/(www\.|m\.)?fb\.watch\/[a-zA-Z0-9_-]+/i,
        /https?:\/\/(www\.|m\.)?facebook\.com\/share\/v\/[a-zA-Z0-9_-]+\//i,
        /https?:\/\/(www\.|m\.)?facebook\.com\/share\/r\/[a-zA-Z0-9_-]+\//i,
        /https?:\/\/(www\.|m\.)?facebook\.com\/reel\/[a-zA-Z0-9_-]+/i,
        /https?:\/\/(www\.|m\.)?facebook\.com\/.*\/posts\/.*video.*/i,
        /https?:\/\/(www\.|m\.)?facebook\.com\/.*\/story\.php\?.*video/i,
        /https?:\/\/(www\.|m\.)?facebook\.com\/photo\.php\?.*video/i,
        /https?:\/\/(www\.|m\.)?facebook\.com\/groups\/.*\/permalink\/.*video/i,
        /https?:\/\/(www\.|m\.)?facebook\.com\/events\/.*\/permalink\/.*video/i,
        /https?:\/\/(www\.|m\.)?facebook\.com\/.*\/.*video.*/i,
        /https?:\/\/(www\.|m\.)?facebook\.com\/.*[?&]video.*/i,
        /https?:\/\/(www\.|m\.)?fb\.com\/.*video.*/i,
        /https?:\/\/(web\.)?facebook\.com\/.*video.*/i,
        /https?:\/\/fb\.com\/.*\/videos\/\d+/i,
        /https?:\/\/facebook\.com\/.*\/videos\/\d+/i,
        /https?:\/\/www\.facebook\.com\/.*\/videos\/\d+/i,
        /https?:\/\/m\.facebook\.com\/.*\/videos\/\d+/i
    ];
    return facebookPatterns.some(pattern => pattern.test(url));
}

// Función del scraper original (mantenida como respaldo)
async function fetchDownloadLinks(text, platform, conn, m) {
    const { SITE_URL, form } = createApiRequest(text, platform);

    try {
        const res = await axios.post(`${SITE_URL}api`, form.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Origin': SITE_URL,
                'Referer': SITE_URL,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'X-Requested-With': 'XMLHttpRequest'
            },
            timeout: 15000
        });

        const html = res?.data?.html;

        if (!html || res?.data?.status !== 'success') {
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
    } catch (error) {
        console.log('Error en scraper:', error);
        return null;
    }
}

function createApiRequest(text, platform) {
    const SITE_URL = 'https://instatiktok.com/';
    const form = new URLSearchParams();
    form.append('url', text);
    form.append('platform', platform);
    form.append('siteurl', SITE_URL);
    return { SITE_URL, form };
}

handler.command = /^(facebook|fb|facebookdl|fbdl|face|fbd|fbdll|face2|fb2|fbd2)$/i;
handler.tags = ['downloader'];
handler.help = ['facebook <url>'];
export default handler;