import axios from 'axios';
import yts from 'yt-search';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { fileURLToPath } from 'url';

const streamPipe = promisify(pipeline);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==== CONFIG DE TU API ====
const API_BASE = process.env.API_BASE || "https://api-sky.ultraplus.click";
const API_KEY = process.env.API_KEY || "Russellxz";

// Almacena tareas pendientes por previewMessageId
const pending = {};

// Utilidad: descarga a disco y devuelve ruta
async function downloadToFile(url, filePath) {
    const res = await axios.get(url, { responseType: "stream" });
    await streamPipe(res.data, fs.createWriteStream(filePath));
    return filePath;
}

// Utilidad: tamaño en MB (decimal)
function fileSizeMB(filePath) {
    const b = fs.statSync(filePath).size;
    return b / (1024 * 1024);
}

// Llama a tu API /api/download/yt.php
async function callMyApi(url, format) {
    const r = await axios.get(`${API_BASE}/api/download/yt.php`, {
        params: { url, format },
        headers: { Authorization: `Bearer ${API_KEY}` },
        timeout: 60000
    });
    if (!r.data || r.data.status !== "true" || !r.data.data) {
        throw new Error("API inválida o sin datos");
    }
    return r.data.data;
}

async function downloadAudio(conn, job, asDocument, reactionMsg) {
    const { chatId, videoUrl, title } = job;

    try {
        // Mensaje de descarga
        const statusMsg = await conn.sendMessage(chatId, { text: `🎧 *Descargando audio...*` }, { quoted: reactionMsg });
        await conn.sendMessage(chatId, { react: { text: '⏳', key: reactionMsg.key } });

        const data = await callMyApi(videoUrl, "audio");
        const mediaUrl = data.audio || data.video;

        if (!mediaUrl) throw new Error("No se pudo obtener audio");

        const tmp = path.join(__dirname, "../tmp");
        if (!fs.existsSync(tmp)) fs.mkdirSync(tmp, { recursive: true });

        const urlPath = new URL(mediaUrl).pathname || "";
        const ext = (urlPath.split(".").pop() || "").toLowerCase();
        const isMp3 = ext === "mp3";

        const inFile = path.join(tmp, `${Date.now()}_in.${ext || "bin"}`);
        await downloadToFile(mediaUrl, inFile);

        let outFile = inFile;
        if (!isMp3) {
            const tryOut = path.join(tmp, `${Date.now()}_out.mp3`);
            try {
                await new Promise((resolve, reject) =>
                    ffmpeg(inFile)
                        .audioCodec("libmp3lame")
                        .audioBitrate("128k")
                        .format("mp3")
                        .save(tryOut)
                        .on("end", resolve)
                        .on("error", reject)
                );
                outFile = tryOut;
                try { fs.unlinkSync(inFile); } catch {}
            } catch (e) {
                outFile = inFile;
            }
        }

        const sizeMB = fileSizeMB(outFile);
        if (sizeMB > 99) {
            try { fs.unlinkSync(outFile); } catch {}
            await conn.sendMessage(chatId, { react: { text: '❌', key: reactionMsg.key } });
            await conn.sendMessage(chatId, { text: `❌ El audio pesa ${sizeMB.toFixed(2)}MB (>99MB).` }, { quoted: reactionMsg });
            return;
        }

        const buffer = fs.readFileSync(outFile);

        // Eliminar mensaje de estado
        await conn.sendMessage(chatId, { delete: statusMsg.key });

        await conn.sendMessage(chatId, { react: { text: '✅', key: reactionMsg.key } });

        await conn.sendMessage(chatId, {
            [asDocument ? "document" : "audio"]: buffer,
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`
        }, { quoted: reactionMsg });

        try { fs.unlinkSync(outFile); } catch {}

    } catch (error) {
        await conn.sendMessage(chatId, { react: { text: '❌', key: reactionMsg.key } });
        await conn.sendMessage(chatId, { text: `❌ Error: ${error.message}` }, { quoted: reactionMsg });
    }
}

async function downloadVideo(conn, job, asDocument, reactionMsg) {
    const { chatId, videoUrl, title } = job;

    try {
        // Mensaje de descarga
        const statusMsg = await conn.sendMessage(chatId, { text: `🎬 *Descargando video...*` }, { quoted: reactionMsg });
        await conn.sendMessage(chatId, { react: { text: '⏳', key: reactionMsg.key } });

        const data = await callMyApi(videoUrl, "video");
        const mediaUrl = data.video || data.audio;

        if (!mediaUrl) throw new Error("No se pudo obtener video");

        const tmp = path.join(__dirname, "../tmp");
        if (!fs.existsSync(tmp)) fs.mkdirSync(tmp, { recursive: true });
        const file = path.join(tmp, `${Date.now()}_vid.mp4`);
        await downloadToFile(mediaUrl, file);

        const sizeMB = fileSizeMB(file);
        if (sizeMB > 99) {
            try { fs.unlinkSync(file); } catch {}
            await conn.sendMessage(chatId, { react: { text: '❌', key: reactionMsg.key } });
            await conn.sendMessage(chatId, { text: `❌ El video pesa ${sizeMB.toFixed(2)}MB (>99MB).` }, { quoted: reactionMsg });
            return;
        }

        // Eliminar mensaje de estado
        await conn.sendMessage(chatId, { delete: statusMsg.key });

        await conn.sendMessage(chatId, { react: { text: '✅', key: reactionMsg.key } });

        await conn.sendMessage(chatId, {
            [asDocument ? "document" : "video"]: fs.readFileSync(file),
            mimetype: "video/mp4",
            fileName: `${title}.mp4`
        }, { quoted: reactionMsg });

        try { fs.unlinkSync(file); } catch {}

    } catch (error) {
        await conn.sendMessage(chatId, { react: { text: '❌', key: reactionMsg.key } });
        await conn.sendMessage(chatId, { text: `❌ Error: ${error.message}` }, { quoted: reactionMsg });
    }
}

let handler = async (m, { args, conn, text, usedPrefix, command }) => {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    if (!text) throw `🎵 Usa: ${usedPrefix + command} <término>\nEj: *${usedPrefix + command}* bad bunny`;

    try {
        const res = await yts(text);
        const video = res.videos?.[0];
        if (!video) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            throw '❌ Sin resultados';
        }

        const { url: videoUrl, title, timestamp: duration, thumbnail } = video;

        const caption = `🎵 ${title}\n⏱️ ${duration}\n\nReacciona para descargar:\n\n❤️ Audio MP3\n👍 Video MP4\n😄 Audio Doc\n😢 Video Doc\n\n*Puedes usar las 4 opciones si lo deseas*`;

        const preview = await conn.sendMessage(
            m.chat,
            { 
                image: { url: thumbnail }, 
                caption 
            },
            { quoted: m }
        );

        // guarda trabajo
        pending[preview.key.id] = {
            chatId: m.chat,
            videoUrl,
            title,
            commandMsg: m
        };

        console.log(`✅ Preview enviado con ID: ${preview.key.id}`);
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        // LISTENER CORREGIDO PARA REACCIONES
        if (!conn._play1Reactions) {
            conn._play1Reactions = true;

            conn.ev.on('messages.upsert', async ({ messages }) => {
                for (const msg of messages) {
                    try {
                        // DETECTAR REACCIONES - MÉTODO CORREGIDO
                        if (msg.message?.reactionMessage) {
                            const reaction = msg.message.reactionMessage;
                            const reactedMessageId = reaction.key?.id;
                            const emoji = reaction.text;

                            console.log(`🔍 Reacción detectada:`, {
                                emoji: emoji,
                                reactedMessageId: reactedMessageId,
                                pendingKeys: Object.keys(pending)
                            });

                            if (reactedMessageId && pending[reactedMessageId] && emoji) {
                                const job = pending[reactedMessageId];
                                console.log(`🎯 Procesando reacción "${emoji}" para job: ${reactedMessageId}`);

                                // Reacción de confirmación
                                await conn.sendMessage(job.chatId, { react: { text: '📥', key: msg.key } });

                                // Mapeo de reacciones a opciones
                                const reactionMap = {
                                    '❤️': () => downloadAudio(conn, job, false, msg),
                                    '👍': () => downloadVideo(conn, job, false, msg),
                                    '😄': () => downloadAudio(conn, job, true, msg),
                                    '😢': () => downloadVideo(conn, job, true, msg)
                                };

                                if (reactionMap[emoji]) {
                                    console.log(`🚀 Ejecutando descarga para: ${emoji}`);
                                    await reactionMap[emoji]();
                                    // NO eliminamos de pending para permitir múltiples descargas
                                } else {
                                    await conn.sendMessage(job.chatId, { 
                                        text: '❌ Reacción no válida. Usa: ❤️ 👍 😄 😢' 
                                    }, { quoted: msg });
                                }
                            } else {
                                console.log(`❌ No se pudo procesar reacción:`, {
                                    reactedMessageId: reactedMessageId,
                                    emoji: emoji,
                                    jobExists: reactedMessageId ? !!pending[reactedMessageId] : false
                                });
                            }
                        }
                    } catch (error) {
                        console.error('Error en detector de reacciones:', error);
                    }
                }
            });

            console.log('✅ Listener de reacciones activado correctamente');
        }

        // Limpiar pending después de 10 minutos
        setTimeout(() => {
            if (pending[preview.key.id]) {
                delete pending[preview.key.id];
                console.log('🧹 Limpiado job después de 10 minutos');
            }
        }, 10 * 60 * 1000);

    } catch (error) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        throw `❌ ${error.message}`;
    }
};

handler.command = /^(play1|playpro|ytplay|youtubeplay)$/i;
handler.tags = ['downloader'];
handler.help = ['play1 <búsqueda>'];
export default handler;