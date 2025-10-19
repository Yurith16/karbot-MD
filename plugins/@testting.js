// KARBOT-MD - Sistema de descarga de medios
// Desarrollado por Hernandez

import yts from 'yt-search';
import fetch from 'node-fetch';
import axios from 'axios';
import NodeID3 from 'node-id3';
import fs from 'fs';
import { spawn } from 'child_process';
import { load } from 'cheerio';
import { tmpdir } from 'os';
import { join } from 'path';
const { generateWAMessageFromContent, prepareWAMessageMedia } = (await import("baileys")).default;

const AUDIO_SIZE_LIMIT = 50 * 1024 * 1024;
const VIDEO_SIZE_LIMIT = 100 * 1024 * 1024;
const TMP_DIR = join(process.cwd(), './src/tmp');

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const idioma = global?.db?.data?.users[m.sender]?.language || global.defaultLenguaje;
    const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}/${m.plugin}.json`));
    const tradutor = _translate._testting;

    try {
        const query = args.join(' ');
        if (!query) return m.reply(tradutor.errors.no_query.replace('@command', usedPrefix + command));

        let video;
        const isYouTubeUrl = isValidYouTubeUrl(query);

        if (isYouTubeUrl) {
            video = await getVideoInfoFromUrl(query);
        } else {
            const { videos } = await yts(query);
            if (!videos || videos.length === 0) return m.reply(tradutor.errors.no_results);
            video = videos[0];
        }

        const videoInfoMsg = `${tradutor.video_info.header}\n\n${tradutor.video_info.title.replace('@title', video.title)}\n${tradutor.video_info.author.replace('@author', video.author.name)}\n${tradutor.video_info.duration.replace('@duration', video.duration?.timestamp || '00:00')}\n${tradutor.video_info.views.replace('@views', (video.views || 0).toLocaleString())}\n${tradutor.video_info.published.replace('@published', video.ago || 'Desconocido')}\n${tradutor.video_info.id.replace('@id', video.videoId)}\n${tradutor.video_info.link.replace('@link', video.url)}`.trim();

        if (command !== 'ytmp3' && command !== 'ytmp4') { 
            conn.sendMessage(m.chat, { image: { url: video.thumbnail }, caption: videoInfoMsg }, { quoted: m });
        }

        const isAudio = command === 'test' || command === 'play' || command === 'ytmp3';
        const format = isAudio ? 'mp3' : '720p';

        // 🔧 SCRAPER REPARADO - NUEVO DOMINIO Y MÉTODOS
        const downloadResult = await yt.download(video.url, format);

        if (!downloadResult || !downloadResult.dlink) throw new Error('𝙉𝙤 𝙨𝙚 𝙥𝙪𝙙𝙤 𝙤𝙗𝙩𝙚𝙣𝙚𝙧 𝙚𝙡 𝙚𝙣𝙡𝙖𝙘𝙚 𝙙𝙚 𝙙𝙚𝙨𝙘𝙖𝙧𝙜𝙖');

        const mediaUrl = downloadResult.dlink;

        if (isAudio) {
            const [audioBuffer, thumbnailBuffer] = await Promise.all([
                fetch(mediaUrl).then(res => res.buffer()),
                fetch(video.thumbnail).then(res => res.buffer())
            ]);

            let lyricsData = await Genius.searchLyrics(video.title).catch(() => null);
            if (!lyricsData && !isYouTubeUrl) {
                lyricsData = await Genius.searchLyrics(query).catch(() => null);
            }

            const formattedLyrics = lyricsData ? formatLyrics(lyricsData.lyrics) : null;

            const tags = {
                title: video.title,
                artist: video.author.name,
                album: 'YouTube Audio',
                APIC: thumbnailBuffer,
                year: new Date().getFullYear(),
                comment: {
                    language: 'spa',
                    text: `🎵 𝙙𝙚𝙨𝙘𝙖𝙧𝙜𝙖 𝙥𝙤𝙧 𝙆𝘼𝙍𝘽𝙊𝙏-𝙈𝘿 🎵\n\nVideo De YouTube: ${video.url}`
                }
            };

            if (formattedLyrics) {
                tags.unsynchronisedLyrics = {
                    language: 'spa',
                    text: `🎵 𝙙𝙚𝙨𝙘𝙖𝙧𝙜𝙖 𝙥𝙤𝙧 𝙆𝘼𝙍𝘽𝙊𝙏-𝙈𝘿 🎵\n\nTitulo: ${video.title}\n\n${formattedLyrics}`
                };
            }

            const taggedBuffer = NodeID3.write(tags, audioBuffer);
            const fileName = `${sanitizeFileName(video.title.substring(0, 64))}.mp3`;

            try {
                const audioSize = taggedBuffer.length;
                const shouldSendAsDocument = audioSize > AUDIO_SIZE_LIMIT;

                if (shouldSendAsDocument) {
                    const documentMedia = await prepareWAMessageMedia({ document: taggedBuffer }, { upload: conn.waUploadToServer });
                    const thumbnailMedia = await prepareWAMessageMedia({ image: thumbnailBuffer }, { upload: conn.waUploadToServer });

                    const msg = generateWAMessageFromContent(m.chat, {
                        documentMessage: {
                            ...documentMedia.documentMessage,
                            fileName: fileName,
                            mimetype: 'audio/mpeg',
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
                    const sentMsg = await conn.sendMessage(m.chat, { audio: taggedBuffer, fileName: `${sanitizeFileName(video.title)}.mp3`, mimetype: 'audio/mpeg' }, { quoted: m });

                    setTimeout(async () => {
                        try {
                            if (sentMsg && sentMsg.message) {
                                const audioMsg = sentMsg.message.audioMessage;
                                const duration = audioMsg?.seconds || 0;

                                if (duration === 0 || !duration) {
                                    try {
                                        const repairedBuffer = await repairAudioBuffer(taggedBuffer, fileName);

                                        if (repairedBuffer) {
                                            const repairedSize = repairedBuffer.length;
                                            const shouldSendRepairedAsDocument = repairedSize > AUDIO_SIZE_LIMIT;

                                            if (!shouldSendRepairedAsDocument) {
                                                await conn.sendMessage(m.chat, { audio: repairedBuffer, fileName: `${sanitizeFileName(video.title)}.mp3`, mimetype: 'audio/mpeg' }, { quoted: sentMsg });
                                            } else {
                                                const documentMedia = await prepareWAMessageMedia({ document: repairedBuffer }, { upload: conn.waUploadToServer });
                                                const thumbnailMedia = await prepareWAMessageMedia({ image: thumbnailBuffer }, { upload: conn.waUploadToServer });

                                                const repairMsg = generateWAMessageFromContent(m.chat, {
                                                    documentMessage: {
                                                        ...documentMedia.documentMessage,
                                                        fileName: `${sanitizeFileName(video.title.substring(0, 64))}.mp3`,
                                                        mimetype: 'audio/mpeg',
                                                        jpegThumbnail: thumbnailMedia.imageMessage.jpegThumbnail,
                                                        contextInfo: {
                                                            mentionedJid: [],
                                                            forwardingScore: 0,
                                                            isForwarded: false
                                                        }
                                                    }
                                                }, { quoted: sentMsg });

                                                await conn.relayMessage(m.chat, repairMsg.message, { messageId: repairMsg.key.id });
                                            }
                                        }
                                    } catch (repairError) {
                                        console.log('𝙀𝙧𝙧𝙤𝙧 𝙚𝙣 𝙧𝙚𝙥𝙖𝙧𝙖𝙘𝙞ó𝙣 𝙙𝙚 𝙖𝙪𝙙𝙞𝙤:', repairError.message);
                                    }
                                }
                            }
                        } catch (verifyError) {
                            console.log('𝙀𝙧𝙧𝙤𝙧 𝙚𝙣 𝙫𝙚𝙧𝙞𝙛𝙞𝙘𝙖𝙘𝙞ó𝙣 𝙙𝙚 𝙙𝙪𝙧𝙖𝙘𝙞ó𝙣:', verifyError.message);
                        }
                    }, 2000);
                }
            } catch (audioError) {
                const errorMsg = audioError.message || audioError.toString();
                if (errorMsg.includes('Media upload failed') || 
                    errorMsg.includes('ENOSPC') || 
                    errorMsg.includes('no space left') ||
                    errorMsg.includes('Internal Server Error') ||
                    errorMsg.includes('size') || 
                    errorMsg.includes('memory')) {

                    try {
                        const documentMedia = await prepareWAMessageMedia({ document: taggedBuffer }, { upload: conn.waUploadToServer });
                        const thumbnailMedia = await prepareWAMessageMedia({ image: thumbnailBuffer }, { upload: conn.waUploadToServer });

                        const msg = generateWAMessageFromContent(m.chat, {
                            documentMessage: {
                                ...documentMedia.documentMessage,
                                fileName: fileName,
                                mimetype: 'audio/mpeg',
                                jpegThumbnail: thumbnailMedia.imageMessage.jpegThumbnail,
                                contextInfo: {
                                    mentionedJid: [],
                                    forwardingScore: 0,
                                    isForwarded: false
                                }
                            }
                        }, { quoted: m });

                        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
                    } catch (urlError) {
                        await m.reply(tradutor.errors.generic.replace('@error', '𝙀𝙧𝙧𝙤𝙧 𝙙𝙚 𝙚𝙣𝙫í𝙤. 𝙄𝙣𝙩𝙚𝙣𝙩𝙖 𝙣𝙪𝙚𝙫𝙖𝙢𝙚𝙣𝙩𝙚.'));
                    }
                } else {
                    await m.reply(tradutor.errors.generic.replace('@error', audioError.message));
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
                const shouldSendAsDocument = videoSize > VIDEO_SIZE_LIMIT;
                const fileName = `${sanitizeFileName(video.title.substring(0, 64))}.mp4`;

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
                    await conn.sendMessage(m.chat, { video: videoBuffer, caption: video.title, mimetype: 'video/mp4', fileName: `${sanitizeFileName(video.title)}.mp4` }, { quoted: m });
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
                        await m.reply(tradutor.errors.generic.replace('@error', '𝙀𝙧𝙧𝙤𝙧 𝙙𝙚 𝙚𝙣𝙫í𝙤. 𝙄𝙣𝙩𝙚𝙣𝙩𝙖 𝙣𝙪𝙚𝙫𝙖𝙢𝙚𝙣𝙩𝙚.'));
                    }
                } else {
                    await m.reply(tradutor.errors.generic.replace('@error', videoError.message));
                }
            }
        }

    } catch (e) {
        console.log('𝙀𝙧𝙧𝙤𝙧 𝙜𝙚𝙣𝙚𝙧𝙖𝙡 𝙚𝙣 𝙝𝙖𝙣𝙙𝙡𝙚𝙧:', e.message);
        await m.reply(tradutor.errors.generic.replace('@error', e.message));
    }
};

handler.help = ['test <query>', 'test2 <query>'];
handler.tags = ['downloader'];
handler.command = /^(test|test2|play|play2|ytmp3|ytmp4)$/i;
export default handler;

// 🔧 SCRAPER COMPLETAMENTE REPARADO - NUEVOS ENDPOINTS
const yt = {
    get baseUrl() {
        return {
            origin: 'https://ssyoutube.com' // Nuevo dominio funcional
        }
    },

    get baseHeaders() {
        return {
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'origin': this.baseUrl.origin,
            'referer': this.baseUrl.origin + '/',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'es-ES,es;q=0.9,en;q=0.8'
        }
    },

    validateFormat: function (userFormat) {
        const validFormat = ['mp3', '360p', '720p', '1080p']
        if (!validFormat.includes(userFormat)) throw Error(`𝙁𝙤𝙧𝙢𝙖𝙩𝙤 𝙞𝙣𝙫á𝙡𝙞𝙙𝙤. 𝙁𝙤𝙧𝙢𝙖𝙩𝙤𝙨 𝙙𝙞𝙨𝙥𝙤𝙣𝙞𝙗𝙡𝙚𝙨: ${validFormat.join(', ')}`)
    },

    handleFormat: function (userFormat, searchJson) {
        this.validateFormat(userFormat)
        let result

        if (userFormat == 'mp3') {
            // Buscar enlaces MP3 en diferentes ubicaciones
            result = searchJson.links?.mp3?.mp3128?.k || 
                    searchJson.links?.mp3?.['128']?.k ||
                    searchJson.url ||
                    searchJson.dlink
        } else {
            let selectedFormat
            const allFormats = Object.entries(searchJson.links?.mp4 || {})

            if (allFormats.length === 0) {
                // Si no hay formatos MP4, intentar con URL directa
                result = searchJson.url || searchJson.dlink
            } else {
                const quality = allFormats.map(v => v[1].q).filter(v => /\d+p/.test(v)).map(v => parseInt(v)).sort((a, b) => b - a).map(v => v + 'p')
                if (!quality.includes(userFormat)) {
                    selectedFormat = quality[0]
                } else {
                    selectedFormat = userFormat
                }
                const find = allFormats.find(v => v[1].q == selectedFormat)
                result = find?.[1]?.k || find?.[1]?.url
            }
        }

        if (!result) throw Error(`𝙁𝙤𝙧𝙢𝙖𝙩𝙤 ${userFormat} 𝙣𝙤 𝙙𝙞𝙨𝙥𝙤𝙣𝙞𝙗𝙡𝙚 𝙥𝙖𝙧𝙖 𝙚𝙨𝙩𝙚 𝙫𝙞𝙙𝙚𝙤`)
        return result
    },

    hit: async function (path, payload = null) {
        try {
            const url = `${this.baseUrl.origin}${path}`
            const opts = { 
                headers: this.baseHeaders, 
                method: payload ? 'post' : 'get'
            }

            if (payload) {
                opts.body = new URLSearchParams(payload)
            }

            const r = await fetch(url, opts)
            if (!r.ok) throw Error(`${r.status} ${r.statusText}\n${await r.text()}`)
            const j = await r.json()
            return j
        } catch (e) {
            throw Error(`${path}\n${e.message}`)
        }
    },

    download: async function (queryOrYtUrl, userFormat = 'mp3') {
        this.validateFormat(userFormat)

        // Primero obtener información del video
        let search
        try {
            search = await this.hit('/api/search', {
                "q": queryOrYtUrl,
                "lang": "es"
            })
        } catch (e) {
            // Si falla el primer endpoint, intentar alternativo
            search = await this.hit('/api/convert', {
                "url": queryOrYtUrl
            })
        }

        if (!search || !search.vid) {
            // Si no hay vid, intentar extraer de la URL
            const videoId = extractVideoId(queryOrYtUrl)
            if (!videoId) throw Error(`𝙉𝙤 𝙨𝙚 𝙥𝙪𝙙𝙤 𝙚𝙭𝙩𝙧𝙖𝙚𝙧 𝙚𝙡 𝙄𝘿 𝙙𝙚𝙡 𝙫𝙞𝙙𝙚𝙤: ${queryOrYtUrl}`)

            search = { vid: videoId, links: {} }
        }

        const vid = search.vid
        const k = this.handleFormat(userFormat, search)

        // Convertir el video
        let convert
        try {
            convert = await this.hit('/api/convert', {
                "vid": vid,
                "k": k
            })
        } catch (e) {
            // Si falla la conversión, usar enlace directo si está disponible
            if (search.url || search.dlink) {
                return { 
                    dlink: search.url || search.dlink,
                    status: 'CONVERTED'
                }
            }
            throw e
        }

        if (convert.c_status == 'CONVERTING' || convert.status == 'processing') {
            let convert2
            const limit = 15
            let attempt = 0

            do {
                attempt++
                convert2 = await this.hit(`/api/convert/check?vid=${vid}&k=${k}`)

                if (convert2.c_status == 'CONVERTED' || convert2.status == 'finished') {
                    return convert2
                }

                await new Promise(re => setTimeout(re, 3000))
            } while (attempt < limit && (convert2.c_status == 'CONVERTING' || convert2.status == 'processing'))

            throw Error('𝙀𝙡 𝙖𝙧𝙘𝙝𝙞𝙫𝙤 𝙖ú𝙣 𝙨𝙚 𝙚𝙨𝙩á 𝙥𝙧𝙤𝙘𝙚𝙨𝙖𝙣𝙙𝙤. 𝙄𝙣𝙩𝙚𝙣𝙩𝙖 𝙙𝙚 𝙣𝙪𝙚𝙫𝙤 𝙚𝙣 𝙪𝙣𝙤𝙨 𝙢𝙤𝙢𝙚𝙣𝙩𝙤𝙨.')
        } else {
            return convert
        }
    },
}

function isValidYouTubeUrl(url) {
    const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/|music\.youtube\.com\/watch\?v=)/i;
    return ytRegex.test(url) && extractVideoId(url);
}

async function getVideoInfoFromUrl(url) {
    try {
        const videoId = extractVideoId(url);
        if (!videoId) throw new Error('𝙐𝙍𝙇 𝙙𝙚 𝙔𝙤𝙪𝙏𝙪𝙗𝙚 𝙣𝙤 𝙫á𝙡𝙞𝙙𝙖');
        const videoInfo = await yts({ videoId: videoId });

        if (!videoInfo || !videoInfo.title) {
            throw new Error('𝙉𝙤 𝙨𝙚 𝙥𝙪𝙙𝙤 𝙤𝙗𝙩𝙚𝙣𝙚𝙧 𝙞𝙣𝙛𝙤𝙧𝙢𝙖𝙘𝙞ó𝙣 𝙙𝙚𝙡 𝙫𝙞𝙙𝙚𝙤');
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
        if (!videoId) throw new Error('𝙄𝘿 𝙙𝙚 𝙫𝙞𝙙𝙚𝙤 𝙣𝙤 𝙫á𝙡𝙞𝙙𝙤');
        return {
            videoId: videoId,
            url: url,
            title: '𝙑𝙞𝙙𝙚𝙤 𝙙𝙚 𝙔𝙤𝙪𝙏𝙪𝙗𝙚', 
            author: {
                name: '𝘾𝙖𝙣𝙖𝙡 𝙙𝙚 𝙔𝙤𝙪𝙏𝙪𝙗𝙚' 
            },
            duration: {
                seconds: 0,
                timestamp: '0:00'
            },
            thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            views: 0,
            ago: '𝘿𝙚𝙨𝙘𝙤𝙣𝙤𝙘𝙞𝙙𝙤'
        };

    } catch (error) {
        throw new Error(`𝙀𝙧𝙧𝙤𝙧 𝙖𝙡 𝙥𝙧𝙤𝙘𝙚𝙨𝙖𝙧 𝙐𝙍𝙇 𝙙𝙚 𝙔𝙤𝙪𝙏𝙪𝙗𝙚: ${error.message}`);
    }
}

function sanitizeFileName(name) {
    return name.replace(/[\\/:*?"<>|]/g, '');
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

function extractVideoId(url) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|m\.youtube\.com\/watch\?v=)([^&\n?#]+)/);
    return match ? match[1] : null;
}

const Genius = {
    async searchLyrics(query) {
        try {
            const searchUrl = `https://genius.com/api/search/song?q=${encodeURIComponent(query)}`;
            const searchRes = await axios.get(searchUrl);

            if (!searchRes.data.response?.sections?.[0]?.hits?.length) {
                throw new Error('𝙉𝙤 𝙨𝙚 𝙚𝙣𝙘𝙤𝙣𝙩𝙧𝙖𝙧𝙤𝙣 𝙡𝙚𝙩𝙧𝙖𝙨 𝙚𝙣 𝙂𝙚𝙣𝙞𝙪𝙨.');
            }

            const songPath = searchRes.data.response.sections[0].hits[0].result.path;
            const lyricsUrl = `https://genius.com${songPath}`;
            const { data } = await axios.get(lyricsUrl);
            const $ = load(data); 

            let lyrics = $('div[class*="Lyrics__Container"]').html();
            if (!lyrics) throw new Error('𝙇𝙚𝙩𝙧𝙖 𝙣𝙤 𝙙𝙞𝙨𝙥𝙤𝙣𝙞𝙗𝙡𝙚 𝙚𝙣 𝙛𝙤𝙧𝙢𝙖𝙩𝙤 𝙚𝙨𝙩𝙧𝙪𝙘𝙩𝙪𝙧𝙖𝙙𝙤.');

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
                '-c:a', 'libmp3lame',
                '-b:a', '128k',
                '-ac', '2',
                '-ar', '44100',
                '-y',
                outputPath
            ]);

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
                        reject(new Error(`𝙁𝙁𝙢𝙥𝙚𝙜 𝙛𝙖𝙡𝙡ó 𝙘𝙤𝙣 𝙘ó𝙙𝙞𝙜𝙤 ${code}: ${stderr}`));
                    }
                } catch (error) {
                    reject(error);
                }
            });

            ffmpeg.on('error', (error) => {
                reject(error);
            });

            setTimeout(() => {
                if (ffmpeg.exitCode === null) {
                    ffmpeg.kill();
                    reject(new Error('𝙏𝙞𝙚𝙢𝙥𝙤 𝙙𝙚 𝙚𝙨𝙥𝙚𝙧𝙖 𝙖𝙜𝙤𝙩𝙖𝙙𝙤'));
                }
            }, 30000);
        });

    } catch (error) {
        console.log('𝙀𝙧𝙧𝙤𝙧 𝙚𝙣 𝙧𝙚𝙥𝙖𝙧𝙖𝙘𝙞ó𝙣 𝙙𝙚 𝙖𝙪𝙙𝙞𝙤:', error.message);
        try {
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        } catch (cleanupError) {}
        throw error;
    }
}