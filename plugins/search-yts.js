import { prepareWAMessageMedia, generateWAMessageFromContent, getDevice } from "baileys"
import yts from 'yt-search';
import fs from 'fs';

const handler = async (m, { conn, text, usedPrefix: prefijo }) => {
    // Sistema de reacción - indicar procesamiento
    await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

    if (!text) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        throw `*🔍 FALTA EL TÉRMINO DE BÚSQUEDA*\n\n_Escribe lo que quieres buscar en YouTube después del comando_\n\n*Ejemplo:*\n*${prefijo}ytsearch música relax*`;
    }

    // Reacción de búsqueda
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    const device = await getDevice(m.key.id);

    if (device !== 'desktop' || device !== 'web') {      
        const results = await yts(text);
        if (!results || !results?.videos) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply('*❌ NO SE ENCONTRARON VIDEOS*\n\n_No se encontraron resultados para tu búsqueda._');
        }

        const videos = results.videos.slice(0, 20);
        const randomIndex = Math.floor(Math.random() * videos.length);
        const randomVideo = videos[randomIndex];

        try {
            var messa = await prepareWAMessageMedia({ image: {url: randomVideo.thumbnail}}, { upload: conn.waUploadToServer });

            const interactiveMessage = {
                body: { 
                    text: `*🎬 RESULTADOS DE YOUTUBE*\n\n*• Videos encontrados:* ${results.videos.length}\n*• Video aleatorio:*\n*📺 Título:* ${randomVideo.title}\n*👤 Autor:* ${randomVideo.author.name}\n*👀 Vistas:* ${randomVideo.views}\n*⏰ Duración:* ${randomVideo.timestamp}\n*🔗 URL:* ${randomVideo.url}`.trim() 
                },
                footer: { text: `🤖 ${global.wm}`.trim() },  
                header: {
                    title: `*🎬 KARBOT - YOUTUBE SEARCH*`,
                    hasMediaAttachment: true,
                    imageMessage: messa.imageMessage,
                },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: 'single_select',
                            buttonParamsJson: JSON.stringify({
                                title: '📥 OPCIONES DE DESCARGA',
                                sections: videos.map((video) => ({
                                    title: `🎬 ${video.title.slice(0, 20)}...`,
                                    rows: [
                                        {
                                            header: video.title,
                                            title: `🎵 ${video.author.name}`,
                                            description: 'Descargar como MP3 (audio)',
                                            id: `${prefijo}ytmp3 ${video.url}`
                                        },
                                        {
                                            header: video.title,
                                            title: `🎥 ${video.author.name}`,
                                            description: 'Descargar como MP4 (video)',
                                            id: `${prefijo}ytmp4 ${video.url}`
                                        }
                                    ]
                                }))
                            })
                        }
                    ],
                    messageParamsJson: ''
                }
            };        

            let msg = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: {
                        interactiveMessage,
                    },
                },
            }, { userJid: conn.user.jid, quoted: m });

            // Reacción de éxito
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

            conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

        } catch (error) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            console.error('Error en ytsearch:', error);
            m.reply('*❌ ERROR AL BUSCAR*\n\n_No se pudo cargar la interfaz interactiva. Mostrando resultados en texto...*');

            // Fallback a modo texto
            const tes = results.all;
            const teks = results.all.map((v) => {
                switch (v.type) {
                    case 'video': return `
🎬 *${v.title}*
👤 *Autor:* ${v.author.name}
🔗 *URL:* ${v.url}
⏰ *Duración:* ${v.timestamp}
📅 *Publicado:* ${v.ago}
👀 *Vistas:* ${v.views}
⬇️ *Descargar:* ${prefijo}ytmp3 ${v.url} | ${prefijo}ytmp4 ${v.url}`;
                }
            }).filter((v) => v).join('\n\n────────────────\n\n');

            conn.sendFile(m.chat, tes[0].thumbnail, 'youtube.jpg', `*🎬 RESULTADOS PARA: ${text}*\n\n${teks.trim()}`, m);
        }

    } else {
        // Modo para desktop/web
        const results = await yts(text);
        if (!results || !results.all) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply('*❌ NO SE ENCONTRARON VIDEOS*');
        }

        const tes = results.all;
        const teks = results.all.map((v) => {
            switch (v.type) {
                case 'video': return `
🎬 *${v.title}*
👤 *Autor:* ${v.author.name}
🔗 *URL:* ${v.url}
⏰ *Duración:* ${v.timestamp}
📅 *Publicado:* ${v.ago}
👀 *Vistas:* ${v.views}
⬇️ *Descargar:* ${prefijo}ytmp3 ${v.url} | ${prefijo}ytmp4 ${v.url}`;
            }
        }).filter((v) => v).join('\n\n────────────────\n\n');

        // Reacción de éxito
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        conn.sendFile(m.chat, tes[0].thumbnail, 'youtube.jpg', `*🎬 RESULTADOS PARA: ${text}*\n\n${teks.trim()}`, m);
    }    
};

handler.help = ['ytsearch <texto>'];
handler.tags = ['search'];
handler.command = /^(ytsearch|yts|searchyt|buscaryt|videosearch|audiosearch|buscarvideo)$/i;
export default handler;