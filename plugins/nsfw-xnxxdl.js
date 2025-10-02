import fetch from 'node-fetch';
import cheerio from 'cheerio';
import fs from 'fs'; // Necesario si usas fs.readFileSync en algún otro lugar

const handler = async (m, {conn, args, command, usedPrefix}) => {
    // --- Textos estáticos (sin traducción) ---
    const HORNY_MODE_DISABLED = `⚠️ El modo caliente no está activado en este chat. Actívalo con: *#enable modohorny*`;
    const NO_ARGUMENT = `❌ Por favor, proporciona un enlace o un número de la lista de búsqueda. Ejemplo:\n\n*1.* ${usedPrefix + command} https://www.xnxx.com/video-14lcwbe8/rubia_novia_follada_en_cuarto_de_bano\n*2.* ${usedPrefix + command} 3 (para descargar el tercer resultado de la última búsqueda)`;
    const DOWNLOADING_MESSAGE = '⏳ Descargando video... Esto puede tomar un momento.';
    const LIST_INDEX_TOO_HIGH = '❌ El número de video que proporcionaste es demasiado alto. Solo hay %s videos en la lista.';
    const NO_RECENT_SEARCH = `❌ No hay una lista de videos de búsqueda reciente. Usa *${usedPrefix}xnxxsearch <texto>* para buscar primero.`;
    const NO_OWN_SEARCH = `❌ No hay una lista de videos de búsqueda reciente tuya. Usa *${usedPrefix}xnxxsearch <texto>* para buscar primero.`;
    const DOWNLOAD_ERROR = `❌ Ocurrió un error al descargar el video. Verifica el enlace o el número.\n*◉ https://www.xnxx.com/video-14lcwbe8/rubia_novia_follada_en_cuarto_de_bano*`;

    // Variables para reacciones
    const reactionStart = '⏳';
    const reactionSuccess = '✅';
    const reactionError = '❌';

    // 1. Verificar el modo caliente
    if (!db.data.chats[m.chat].modohorny && m.isGroup) {
        await conn.sendMessage(m.chat, { react: { text: reactionError, key: m.key } });
        throw HORNY_MODE_DISABLED;
    }

    // 2. Verificar el argumento
    if (!args[0]) {
        await conn.sendMessage(m.chat, { react: { text: reactionError, key: m.key } });
        throw NO_ARGUMENT;
    }

    // 3. Iniciar descarga
    try {
        await conn.sendMessage(m.chat, { react: { text: reactionStart, key: m.key } });
        await conn.reply(m.chat, DOWNLOADING_MESSAGE, m);

        let xnxxLink = '';

        if (args[0].includes('xnxx')) {
            // Caso 1: Se proporciona un enlace directo
            xnxxLink = args[0];
        } else {
            // Caso 2: Se proporciona un número de la lista
            const index = parseInt(args[0]) - 1;
            if (index >= 0) {
                if (Array.isArray(global.videoListXXX) && global.videoListXXX.length > 0) {
                    const matchingItem = global.videoListXXX.find((item) => item.from === m.sender);

                    if (matchingItem) {
                        if (index < matchingItem.urls.length) {
                            xnxxLink = matchingItem.urls[index];
                        } else {
                            // Usando String.prototype.replace para simular el formato de traducción
                            await conn.sendMessage(m.chat, { react: { text: reactionError, key: m.key } });
                            throw LIST_INDEX_TOO_HIGH.replace('%s', matchingItem.urls.length);
                        }
                    } else {
                        await conn.sendMessage(m.chat, { react: { text: reactionError, key: m.key } });
                        throw NO_OWN_SEARCH;
                    }
                } else {
                    await conn.sendMessage(m.chat, { react: { text: reactionError, key: m.key } });
                    throw NO_RECENT_SEARCH;
                }
            } else {
                // Si el argumento no es un número válido ni un enlace
                await conn.sendMessage(m.chat, { react: { text: reactionError, key: m.key } });
                throw NO_ARGUMENT;
            }
        }

        // Ejecutar la descarga
        const res = await xnxxdl(xnxxLink);
        const json = res.result.files;

        // Enviar el video
        conn.sendMessage(m.chat, {
            document: {url: json.high},
            mimetype: 'video/mp4',
            fileName: res.result.title.replace(/[^\w\s]/gi, '') + '.mp4' // Limpiar el nombre y agregar extensión
        }, {quoted: m});

        // Reacción de éxito
        await conn.sendMessage(m.chat, { react: { text: reactionSuccess, key: m.key } });

    } catch (error) {
        console.error("Error en xnxxdl:", error);
        // Si ya se envió una reacción de error antes, la ignoramos.
        // Si no, enviamos la reacción de error general.
        if (error.message && !error.message.includes('react')) {
             await conn.sendMessage(m.chat, { react: { text: reactionError, key: m.key } });
        }
        throw DOWNLOAD_ERROR;
    }
};

handler.tags = ['nsfw'];
handler.help = ['xnxxdl'];
handler.command = /^(xnxxdl)$/i;
export default handler;

// Función de descarga (sin cambios en la lógica de scraping)
async function xnxxdl(URL) {
    return new Promise((resolve, reject) => {
        fetch(`${URL}`, {method: 'get'})
            .then((res) => res.text())
            .then((res) => {
                const $ = cheerio.load(res, {xmlMode: false});

                // Variables del resultado (mantenidas en camelCase)
                const title = $('meta[property="og:title"]').attr('content');
                const duration = $('meta[property="og:duration"]').attr('content');
                const image = $('meta[property="og:image"]').attr('content');
                const videoType = $('meta[property="og:video:type"]').attr('content');
                const videoWidth = $('meta[property="og:video:width"]').attr('content');
                const videoHeight = $('meta[property="og:video:height"]').attr('content');
                const info = $('span.metadata').text();

                // Extracción de enlaces de video
                const videoScript = $('#video-player-bg > script:nth-child(6)').html();
                const files = {
                    low: (videoScript.match('html5player.setVideoUrlLow\\(\'(.*?)\'\\);') || [])[1],
                    high: (videoScript.match('html5player.setVideoUrlHigh\\(\'(.*?)\'\\);') || [])[1],
                    HLS: (videoScript.match('html5player.setVideoHLS\\(\'(.*?)\'\\);') || [])[1],
                    thumb: (videoScript.match('html5player.setThumbUrl\\(\'(.*?)\'\\);') || [])[1],
                    thumb69: (videoScript.match('html5player.setThumbUrl169\\(\'(.*?)\'\\);') || [])[1],
                    thumbSlide: (videoScript.match('html5player.setThumbSlide\\(\'(.*?)\'\\);') || [])[1],
                    thumbSlideBig: (videoScript.match('html5player.setThumbSlideBig\\(\'(.*?)\'\\);') || [])[1]
                };

                resolve({status: 200, result: {title, URL, duration, image, videoType, videoWidth, videoHeight, info, files}});
            })
            .catch((err) => reject({code: 503, status: false, result: err}));
    });
}