// Karbot - Sistema de descarga de medios

import yts from 'yt-search';
import fetch from 'node-fetch';
import axios from 'axios';
import NodeID3 from 'node-id3';
import fs from 'fs';
import { spawn } from 'child_process';
import { load } from 'cheerio';
import { tmpdir } from 'os';
import { join } from 'path';
import crypto from 'crypto';
const { generateWAMessageFromContent, prepareWAMessageMedia } = (await import("baileys")).default;

const AUDIO_SIZE_LIMIT = 50 * 1024 * 1024;
const VIDEO_SIZE_LIMIT = 100 * 1024 * 1024;
const TMP_DIR = join(process.cwd(), './src/tmp');
const API_BASE = "https://honduras-api.onrender.com";

// Función para sanitizar nombres de archivo
function sanitizeFileName(name) {
    return name.replace(/[^a-z0-9áéíóúñü \.,_-]/gim, "").trim();
}

// Función para validar URLs de YouTube
function isValidYouTubeUrl(url) {
    try {
        const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/|music\.youtube\.com\/watch\?v=)/i;
        return ytRegex.test(url) && extractVideoId(url);
    } catch (error) {
        return false;
    }
}

// Función para extraer video ID
function extractVideoId(url) {
    try {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|m\.youtube\.com\/watch\?v=|youtube\.com\/shorts\/)([^&\n?#]+)/,
            /youtube\.com\/watch\?.*v=([^&]+)/,
            /youtu\.be\/([^?#]+)/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        return null;
    } catch (error) {
        return null;
    }
}

// Función para descargar usando API alternativa
async function downloadWithAPI(videoUrl, isAudio = false) {
    try {
        console.log('🌐 Usando API alternativa...');
        const endpoint = isAudio ? '/api/ytmp3' : '/api/ytmp4';
        const apiUrl = `${API_BASE}${endpoint}?url=${encodeURIComponent(videoUrl)}`;

        const response = await axios.get(apiUrl, { 
            timeout: 60000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.data || !response.data.éxito || !response.data.descarga || !response.data.descarga.enlace) {
            throw new Error('API no devolvió enlace válido');
        }

        return {
            dlink: response.data.descarga.enlace,
            status: 'CONVERTED',
            source: 'api',
            quality: response.data.descarga.calidad || (isAudio ? '128kbps' : '720p')
        };
    } catch (error) {
        console.log('❌ API alternativa falló:', error.message);
        throw error;
    }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        const query = args.join(' ');
        if (!query) return m.reply(`*「❌」 Error*\n\n> ✦ *Ingresa:* » ${usedPrefix + command} <busqueda>`);

        let video;
        const isYouTubeUrl = isValidYouTubeUrl(query);

        if (isYouTubeUrl) {
            video = await getVideoInfoFromUrl(query);
        } else {
            const { videos } = await yts(query);
            if (!videos || videos.length === 0) return m.reply(`*「❌」 Error*\n\n> ✦ *No se encontraron resultados*`);
            video = videos[0];
        }

        const videoInfoMsg = `*「🎬」 Información*\n\n` +
                           `> ✦ *Título:* » ${video.title}\n` +
                           `> ✦ *Canal:* » ${video.author.name}\n` +
                           `> ✦ *Duración:* » ${video.duration?.timestamp || '00:00'}\n` +
                           `> ✦ *Vistas:* » ${(video.views || 0).toLocaleString()}\n` +
                           `> ✦ *Publicado:* » ${video.ago || 'Desconocido'}\n` +
                           `> ✦ *Enlace:* » ${video.url}`;

        if (!command.includes('doc')) {
            await conn.sendMessage(m.chat, { image: { url: video.thumbnail }, caption: videoInfoMsg }, { quoted: m });
        }

        const isAudio = command.includes('mp3') || command === 'test' || command === 'play';
        const forceDocument = command.includes('doc');
        const format = isAudio ? 'mp3' : '720p';

        let downloadResult;
        let downloadSource = 'savetube';

        try {
            downloadResult = await savetubeDownload(video.url, format);
        } catch (savetubeError) {
            downloadSource = 'scraper';
            try {
                downloadResult = await yt.download(video.url, format);
            } catch (scraperError) {
                console.log('❌ Scrapers fallaron, usando API alternativa...');
                try {
                    downloadResult = await downloadWithAPI(video.url, isAudio);
                    downloadSource = 'api';
                } catch (apiError) {
                    throw new Error('No se pudo descargar el contenido');
                }
            }
        }

        if (!downloadResult || !downloadResult.dlink) {
            throw new Error('No se pudo obtener el enlace de descarga');
        }

        const mediaUrl = downloadResult.dlink;

        if (isAudio) {
            let audioBuffer;
            try {
                const response = await fetch(mediaUrl);
                if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
                audioBuffer = await response.buffer();

                if (!audioBuffer || audioBuffer.length === 0) {
                    throw new Error('El archivo de audio está vacío');
                }
            } catch (fetchError) {
                await m.reply(`*「❌」 Error*\n\n> ✦ *Error al descargar el audio*`);
                return;
            }

            const thumbnailBuffer = await fetch(video.thumbnail).then(res => res.buffer()).catch(() => null);

            let lyricsData = await Genius.searchLyrics(video.title).catch(() => null);
            if (!lyricsData && !isYouTubeUrl) {
                lyricsData = await Genius.searchLyrics(query).catch(() => null);
            }

            const formattedLyrics = lyricsData ? formatLyrics(lyricsData.lyrics) : null;

            const tags = {
                title: video.title,
                artist: video.author.name,
                album: 'YouTube Audio',
                year: new Date().getFullYear(),
                comment: {
                    language: 'spa',
                    text: `Descargado desde YouTube: ${video.url}`
                }
            };

            if (thumbnailBuffer) {
                tags.APIC = thumbnailBuffer;
            }

            if (formattedLyrics) {
                tags.unsynchronisedLyrics = {
                    language: 'spa',
                    text: `Título: ${video.title}\n\n${formattedLyrics}`
                };
            }

            let taggedBuffer;
            try {
                taggedBuffer = NodeID3.write(tags, audioBuffer);
                if (!taggedBuffer) taggedBuffer = audioBuffer;
            } catch (tagError) {
                taggedBuffer = audioBuffer;
            }

            const fileName = `${sanitizeFileName(video.title.substring(0, 64))}.mp3`;

            // Forzar documento si el comando lo indica o si es muy grande
            const shouldSendAsDocument = forceDocument || taggedBuffer.length > AUDIO_SIZE_LIMIT;

            try {
                let finalAudioBuffer = taggedBuffer;
                try {
                    const repairedBuffer = await repairAudioBuffer(taggedBuffer, fileName);
                    if (repairedBuffer && repairedBuffer.length > 0) {
                        finalAudioBuffer = repairedBuffer;
                    }
                } catch (repairError) {}

                if (shouldSendAsDocument) {
                    const documentMedia = await prepareWAMessageMedia({ document: finalAudioBuffer }, { upload: conn.waUploadToServer });
                    let thumbnailMedia = null;
                    if (thumbnailBuffer) {
                        thumbnailMedia = await prepareWAMessageMedia({ image: thumbnailBuffer }, { upload: conn.waUploadToServer });
                    }

                    const msg = generateWAMessageFromContent(m.chat, {
                        documentMessage: {
                            ...documentMedia.documentMessage,
                            fileName: fileName,
                            mimetype: 'audio/mpeg',
                            jpegThumbnail: thumbnailMedia?.imageMessage?.jpegThumbnail || null,
                            contextInfo: {
                                mentionedJid: [],
                                forwardingScore: 0,
                                isForwarded: false
                            }
                        }
                    }, { quoted: m });

                    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
                } else {
                    await conn.sendMessage(m.chat, { 
                        audio: finalAudioBuffer, 
                        fileName: `${sanitizeFileName(video.title)}.mp3`, 
                        mimetype: 'audio/mpeg',
                        ptt: false 
                    }, { quoted: m });
                }

            } catch (audioError) {
                try {
                    const documentMedia = await prepareWAMessageMedia({ document: taggedBuffer }, { upload: conn.waUploadToServer });
                    let thumbnailMedia = null;
                    if (thumbnailBuffer) {
                        thumbnailMedia = await prepareWAMessageMedia({ image: thumbnailBuffer }, { upload: conn.waUploadToServer });
                    }

                    const msg = generateWAMessageFromContent(m.chat, {
                        documentMessage: {
                            ...documentMedia.documentMessage,
                            fileName: fileName,
                            mimetype: 'audio/mpeg',
                            jpegThumbnail: thumbnailMedia?.imageMessage?.jpegThumbnail || null,
                            contextInfo: {
                                mentionedJid: [],
                                forwardingScore: 0,
                                isForwarded: false
                            }
                        }
                    }, { quoted: m });

                    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
                } catch (finalError) {
                    await m.reply(`*「❌」 Error*\n\n> ✦ *Error al enviar el audio*`);
                }
            }

        } else {
            // Manejo de video
            try {
                const [videoBuffer, thumbnailBuffer] = await Promise.all([
                    fetch(mediaUrl).then(res => res.buffer()),
                    fetch(video.thumbnail).then(res => res.buffer())
                ]);

                const videoSize = videoBuffer.length;
                const fileName = `${sanitizeFileName(video.title.substring(0, 64))}.mp4`;

                // Forzar documento si el comando lo indica, es muy grande o dura más de 10 minutos
                const durationMinutes = video.duration?.seconds ? Math.floor(video.duration.seconds / 60) : 0;
                const shouldSendAsDocument = forceDocument || videoSize > VIDEO_SIZE_LIMIT || durationMinutes > 10;

                if (shouldSendAsDocument) {
                    const documentMedia = await prepareWAMessageMedia({ document: videoBuffer }, { upload: conn.waUploadToServer });
                    const thumbnailMedia = await prepareWAMessageMedia({ image: thumbnailBuffer }, { upload: conn.waUploadToServer });

                    const msg = generateWAMessageFromContent(m.chat, {
                        documentMessage: {
                            ...documentMedia.documentMessage,
                            fileName: fileName,
                            mimetype: 'video/mp4',
                            jpegThumbnail: thumbnailMedia.imageMessage.jpegThumbnail,
                            contextInfo: {
                                mentionedJid: [],
                                forwardingScore: 0,
                                isForwarded: false
                            }
                        }
                    }, { quoted: m });

                    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
                } else {
                    await conn.sendMessage(m.chat, { 
                        video: videoBuffer, 
                        caption: `*「🎬」 ${video.title}*\n\n> ✦ *Duración:* » ${video.duration?.timestamp || '00:00'}\n> ✦ *Calidad:* » ${downloadResult.quality || '720p'}`,
                        mimetype: 'video/mp4', 
                        fileName: `${sanitizeFileName(video.title)}.mp4` 
                    }, { quoted: m });
                }

            } catch (videoError) {
                const errorMsg = videoError.message || videoError.toString();

                if (errorMsg.includes('Media upload failed') || 
                    errorMsg.includes('ENOSPC') || 
                    errorMsg.includes('no space left') ||
                    errorMsg.includes('Internal Server Error') ||
                    errorMsg.includes('size') || 
                    errorMsg.includes('memory')) {

                    try {
                        const urlDocumentMedia = await prepareWAMessageMedia({ document: { url: mediaUrl } }, { upload: conn.waUploadToServer });
                        const urlThumbnailMedia = await prepareWAMessageMedia({ image: { url: video.thumbnail } }, { upload: conn.waUploadToServer });

                        const msg = generateWAMessageFromContent(m.chat, {
                            documentMessage: {
                                ...urlDocumentMedia.documentMessage,
                                fileName: fileName,
                                mimetype: 'video/mp4',
                                jpegThumbnail: urlThumbnailMedia.imageMessage.jpegThumbnail,
                                contextInfo: {
                                    mentionedJid: [],
                                    forwardingScore: 0,
                                    isForwarded: false
                                }
                            }
                        }, { quoted: m });

                        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
                    } catch (urlError) {
                        await m.reply(`*「❌」 Error*\n\n> ✦ *Error de envío. Intenta nuevamente*`);
                    }
                } else {
                    await m.reply(`*「❌」 Error*\n\n> ✦ *${videoError.message}*`);
                }
            }
        }

    } catch (e) {
        await m.reply(`*「❌」 Error*\n\n> ✦ *${e.message}*`);
    }
};

handler.help = ['test <query>', 'test2 <query>', 'ytmp3 <query>', 'ytmp4 <query>', 'ytmp3doc <query>', 'ytmp4doc <query>'];
handler.tags = ['downloader'];
handler.command = /^(test|test2|play|play2|ytmp3|ytmp4|ytmp3doc|ytmp4doc)$/i;
export default handler;

// 🔧 SISTEMA SAVETUBE - ALTERNATIVA CONFIABLE
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
    formats: ['144', '240', '360', '480', '720', '1080', 'mp3'],
    crypto: {
        hexToBuffer: (hexString) => {
            const matches = hexString.match(/.{1,2}/g);
            return Buffer.from(matches.join(''), 'hex');
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
                throw new Error(error)
            }
        }
    },
    youtube: url => {
        if (!url) return null;
        const a = [
            /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
            /youtu\.be\/([a-zA-Z0-9_-]{11})/
        ];
        for (let b of a) {
            if (b.test(url)) return url.match(b)[1];
        }
        return null
    },
    request: async (endpoint, data = {}, method = 'post') => {
        try {
            const { data: response } = await axios({
                method,
                url: `${endpoint.startsWith('http') ? '' : savetube.api.base}${endpoint}`,
                data: method === 'post' ? data : undefined,
                params: method === 'get' ? data : undefined,
                headers: savetube.headers,
                timeout: 30000
            })
            return {
                status: true,
                code: 200,
                data: response
            }
        } catch (error) {
            throw new Error(error)
        }
    },
    getCDN: async () => {
        const response = await savetube.request(savetube.api.cdn, {}, 'get');
        if (!response.status) throw new Error(response)
        return {
            status: true,
            code: 200,
            data: response.data.cdn
        }
    },
    download: async (link, format) => {
        if (!link) {
            return {
                status: false,
                code: 400,
                error: "No link provided. Please provide a valid YouTube link."
            }
        }
        if (!format || !savetube.formats.includes(format)) {
            return {
                status: false,
                code: 400,
                error: "Invalid format. Please choose one of the available formats: 144, 240, 360, 480, 720, 1080, mp3.",
                available_fmt: savetube.formats
            }
        }
        const id = savetube.youtube(link);
        if (!id) throw new Error('Invalid YouTube link.');
        try {
            const cdnx = await savetube.getCDN();
            if (!cdnx.status) return cdnx;
            const cdn = cdnx.data;
            const result = await savetube.request(`https://${cdn}${savetube.api.info}`, {
                url: `https://www.youtube.com/watch?v=${id}`
            });
            if (!result.status) return result;
            const decrypted = await savetube.crypto.decrypt(result.data.data);
            var dl;
            try {
                dl = await savetube.request(`https://${cdn}${savetube.api.download}`, {
                    id: id,
                    downloadType: format === 'mp3' ? 'audio' : 'video',
                    quality: format === 'mp3' ? '128' : format,
                    key: decrypted.key
                });
            } catch (error) {
                throw new Error('Failed to get download link. Please try again later.');
            };
            return {
                status: true,
                code: 200,
                result: {
                    title: decrypted.title || "Unknown Title",
                    type: format === 'mp3' ? 'audio' : 'video',
                    format: format,
                    thumbnail: decrypted.thumbnail || `https://i.ytimg.com/vi/${id}/0.jpg`,
                    download: dl.data.data.downloadUrl,
                    id: id,
                    key: decrypted.key,
                    duration: decrypted.duration,
                    quality: format === 'mp3' ? '128' : format,
                    downloaded: dl.data.data.downloaded
                }
            }
        } catch (error) {
            throw new Error('An error occurred while processing your request. Please try again later.');
        }
    }
};

// Función para usar savetube como alternativa
async function savetubeDownload(url, format) {
    try {
        console.log(`🎯 Usando savetube para formato: ${format}`);
        const result = await savetube.download(url, format === 'mp3' ? 'mp3' : '720');

        if (result && result.status && result.result && result.result.download) {
            return {
                dlink: result.result.download,
                status: 'CONVERTED',
                source: 'savetube',
                quality: result.result.quality
            };
        } else {
            throw new Error('Savetube no devolvió enlace de descarga');
        }
    } catch (error) {
        console.log('❌ Error en savetube:', error.message);
        throw error;
    }
}

// 🔧 SCRAPER ORIGINAL (como fallback)
const yt = {
    get baseUrl() {
        return {
            origin: 'https://ssyoutube.com',
            alternative: 'https://savefrom.net'
        }
    },

    get baseHeaders() {
        return {
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'origin': this.baseUrl.origin,
            'referer': this.baseUrl.origin + '/',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'es-ES,es;q=0.9,en;q=0.8',
            'x-requested-with': 'XMLHttpRequest'
        }
    },

    validateFormat: function (userFormat) {
        const validFormat = ['mp3', '360p', '720p', '1080p']
        if (!validFormat.includes(userFormat)) throw Error(`Formato inválido. Formatos disponibles: ${validFormat.join(', ')}`)
    },

    handleFormat: function (userFormat, searchJson) {
        this.validateFormat(userFormat)
        let result

        if (userFormat == 'mp3') {
            result = searchJson.links?.mp3?.mp3128?.k || 
                    searchJson.links?.mp3?.['128']?.k ||
                    searchJson.links?.audio?.mp3128?.k ||
                    searchJson.url ||
                    searchJson.dlink
        } else {
            let selectedFormat
            const allFormats = Object.entries(searchJson.links?.mp4 || searchJson.links?.video || {})

            if (allFormats.length === 0) {
                result = searchJson.url || searchJson.dlink
            } else {
                const quality = allFormats.map(v => v[1].q).filter(v => v && /\d+p/.test(v)).map(v => parseInt(v)).sort((a, b) => b - a).map(v => v + 'p')
                if (!quality.includes(userFormat)) {
                    selectedFormat = quality[0] || '720p'
                } else {
                    selectedFormat = userFormat
                }
                const find = allFormats.find(v => v[1].q == selectedFormat)
                result = find?.[1]?.k || find?.[1]?.url
            }
        }

        if (!result) throw Error(`Formato ${userFormat} no disponible para este video`)
        return result
    },

    hit: async function (path, payload = null) {
        try {
            const url = `${this.baseUrl.origin}${path}`
            const opts = { 
                headers: this.baseHeaders, 
                method: payload ? 'POST' : 'GET',
                timeout: 30000
            }

            if (payload) {
                opts.body = new URLSearchParams(payload)
            }

            const r = await fetch(url, opts)
            if (!r.ok) {
                if (this.baseUrl.alternative) {
                    const altUrl = `${this.baseUrl.alternative}${path}`
                    const altR = await fetch(altUrl, opts)
                    if (altR.ok) {
                        return await altR.json()
                    }
                }
                throw Error(`${r.status} ${r.statusText}`)
            }
            const j = await r.json()
            return j
        } catch (e) {
            throw Error(`${path}\n${e.message}`)
        }
    },

    download: async function (queryOrYtUrl, userFormat = 'mp3') {
        this.validateFormat(userFormat)

        let search
        try {
            search = await this.hit('/api/search', {
                "q": queryOrYtUrl,
                "lang": "es"
            })
        } catch (e) {
            try {
                search = await this.hit('/api/convert', {
                    "url": queryOrYtUrl
                })
            } catch (e2) {
                const videoId = extractVideoId(queryOrYtUrl)
                if (!videoId) throw Error(`No se pudo extraer el ID del video: ${queryOrYtUrl}`)

                search = { 
                    vid: videoId, 
                    links: {},
                    url: `https://www.youtube.com/watch?v=${videoId}`
                }
            }
        }

        if (!search || !search.vid) {
            const videoId = extractVideoId(queryOrYtUrl)
            if (!videoId) throw Error(`No se pudo extraer el ID del video: ${queryOrYtUrl}`)
            search = { vid: videoId, links: {} }
        }

        const vid = search.vid
        const k = this.handleFormat(userFormat, search)

        let convert
        try {
            convert = await this.hit('/api/convert', {
                "vid": vid,
                "k": k
            })
        } catch (e) {
            if (search.url || search.dlink) {
                return { 
                    dlink: search.url || search.dlink,
                    status: 'CONVERTED'
                }
            }
            throw e
        }

        if (convert && (convert.c_status == 'CONVERTING' || convert.status == 'processing')) {
            let convert2
            const limit = 8
            let attempt = 0

            do {
                attempt++
                try {
                    convert2 = await this.hit(`/api/convert/check?vid=${vid}&k=${k}`)

                    if (convert2.c_status == 'CONVERTED' || convert2.status == 'finished') {
                        return convert2
                    }

                    await new Promise(resolve => setTimeout(resolve, 2000))
                } catch (checkError) {
                    console.log('Error en check:', checkError.message)
                }
            } while (attempt < limit && (convert2?.c_status == 'CONVERTING' || convert2?.status == 'processing'))

            throw Error('El archivo aún se está procesando. Intenta de nuevo en unos momentos.')
        } else {
            return convert || { dlink: search.url, status: 'CONVERTED' }
        }
    }
}

// Funciones auxiliares
async function getVideoInfoFromUrl(url) {
    try {
        const videoId = extractVideoId(url);
        if (!videoId) throw new Error('URL de YouTube no válida');
        const videoInfo = await yts({ videoId: videoId });

        if (!videoInfo || !videoInfo.title) {
            throw new Error('No se pudo obtener información del video');
        }
        return {
            videoId: videoId,
            url: `https://youtu.be/${videoId}`,
            title: videoInfo.title,
            author: {
                name: videoInfo.author.name
            },
            duration: {
                seconds: videoInfo.seconds,
                timestamp: videoInfo.timestamp
            },
            thumbnail: videoInfo.thumbnail,
            views: videoInfo.views,
            ago: videoInfo.ago
        };

    } catch (error) {
        return getVideoInfoFromYouTubeAPI(url);
    }
}

async function getVideoInfoFromYouTubeAPI(url) {
    try {
        const videoId = extractVideoId(url);
        if (!videoId) throw new Error('ID de video no válido');
        return {
            videoId: videoId,
            url: url,
            title: 'Video de YouTube', 
            author: {
                name: 'Canal de YouTube' 
            },
            duration: {
                seconds: 0,
                timestamp: '0:00'
            },
            thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            views: 0,
            ago: 'Desconocido'
        };
    } catch (error) {
        throw new Error(`Error al procesar URL de YouTube: ${error.message}`);
    }
}

function formatLyrics(lyrics) {
    if (!lyrics) return null;
    return lyrics
        .replace(/^\d+\s+Contributor[s]?.*?Lyrics/i, '')
        .replace(/\[Letra de ".*?"\]/g, '')
        .replace(/\[.*?\s+Lyrics\]/g, '')
        .replace(/\[([^\]]+)\]/g, '\n[$1]\n')
        .replace(/^\s+|\s+$/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .filter(line => !line.match(/^(Embed|You might also like|See.*?Live)/i))
        .join('\n');
}

const Genius = {
    async searchLyrics(query) {
        try {
            const searchUrl = `https://genius.com/api/search/song?q=${encodeURIComponent(query)}`;
            const searchRes = await axios.get(searchUrl);

            if (!searchRes.data.response?.sections?.[0]?.hits?.length) {
                throw new Error('No se encontraron letras en Genius.');
            }

            const songPath = searchRes.data.response.sections[0].hits[0].result.path;
            const lyricsUrl = `https://genius.com${songPath}`;
            const { data } = await axios.get(lyricsUrl);
            const $ = load(data); 

            let lyrics = $('div[class*="Lyrics__Container"]').html();
            if (!lyrics) throw new Error('Letra no disponible en formato estructurado.');

            lyrics = lyrics.replace(/<br>/g, '\n').replace(/<[^>]+>/g, '').trim();

            return {
                title: searchRes.data.response.sections[0].hits[0].result.title,
                artist: searchRes.data.response.sections[0].hits[0].result.primary_artist.name,
                url: lyricsUrl,
                lyrics: lyrics
            };

        } catch (error) {
            throw error;
        }
    }
};

async function repairAudioBuffer(audioBuffer, fileName) {
    if (!fs.existsSync(TMP_DIR)) {
        fs.mkdirSync(TMP_DIR, { recursive: true });
    }

    const inputPath = join(TMP_DIR, `input_${Date.now()}_${fileName}`);
    const outputPath = join(TMP_DIR, `repaired_${Date.now()}_${fileName}`);

    try {
        fs.writeFileSync(inputPath, audioBuffer);

        return new Promise((resolve, reject) => {
            const ffmpeg = spawn('ffmpeg', [
                '-i', inputPath,
                '-f', 'mp3',
                '-c:a', 'libmp3lame',
                '-b:a', '192k',
                '-ac', '2',
                '-ar', '44100',
                '-y',
                outputPath
            ], {
                stdio: ['ignore', 'ignore', 'pipe']
            });

            let stderr = '';

            ffmpeg.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            ffmpeg.on('close', (code) => {
                try {
                    if (code === 0 && fs.existsSync(outputPath)) {
                        const repairedBuffer = fs.readFileSync(outputPath);
                        fs.unlinkSync(inputPath);
                        fs.unlinkSync(outputPath);
                        resolve(repairedBuffer);
                    } else {
                        if (fs.existsSync(inputPath)) {
                            const originalBuffer = fs.readFileSync(inputPath);
                            fs.unlinkSync(inputPath);
                            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                            resolve(originalBuffer);
                        } else {
                            reject(new Error(`No se pudo procesar el audio: ${stderr}`));
                        }
                    }
                } catch (error) {
                    reject(error);
                }
            });

            ffmpeg.on('error', (error) => {
                console.log('Error en FFmpeg:', error.message);
                try {
                    if (fs.existsSync(inputPath)) {
                        const originalBuffer = fs.readFileSync(inputPath);
                        fs.unlinkSync(inputPath);
                        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                        resolve(originalBuffer);
                    } else {
                        reject(error);
                    }
                } catch (cleanupError) {
                    reject(error);
                }
            });

            setTimeout(() => {
                if (ffmpeg.exitCode === null) {
                    ffmpeg.kill();
                    try {
                        if (fs.existsSync(inputPath)) {
                            const originalBuffer = fs.readFileSync(inputPath);
                            fs.unlinkSync(inputPath);
                            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                            resolve(originalBuffer);
                        } else {
                            reject(new Error('Tiempo de espera agotado'));
                        }
                    } catch (timeoutError) {
                        reject(new Error('Tiempo de espera agotado'));
                    }
                }
            }, 15000);
        });

    } catch (error) {
        console.log('Error en reparación de audio:', error.message);
        try {
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        } catch (cleanupError) {}
        return audioBuffer;
    }
}