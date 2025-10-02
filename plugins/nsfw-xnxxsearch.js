import fetch from 'node-fetch';
import fs from 'fs'; // Necesario si usas fs.readFileSync en alguna otra parte del bot
import cheerio from 'cheerio'; // Necesario para la función xnxxsearch

const handler = async (m, { conn, text, usedPrefix, command }) => {
    // --- Textos estáticos (sin traducción) ---
    const HORNY_MODE_DISABLED = `⚠️ El modo caliente no está activado en este chat. Actívalo con: *${usedPrefix}enable modohorny*`;
    const NO_QUERY_PROVIDED = `❌ Por favor, proporciona un término de búsqueda. Ejemplo: ${usedPrefix + command} Con mi prima`;
    const SEARCH_TITLE = '🔍 *RESULTADOS DE LA BÚSQUEDA:*';

    // Variables para reacciones
    const reactionStart = '⏳';
    const reactionSuccess = '✅';
    const reactionError = '❌';

    // 1. Verificar el modo caliente
    if (!db.data.chats[m.chat].modohorny && m.isGroup) {
        // Reacción de error antes de lanzar el throw
        await conn.sendMessage(m.chat, { react: { text: reactionError, key: m.key } });
        throw HORNY_MODE_DISABLED;
    }

    // 2. Verificar el argumento
    if (!text) {
        // Reacción de error antes de lanzar el throw
        await conn.sendMessage(m.chat, { react: { text: reactionError, key: m.key } });
        throw NO_QUERY_PROVIDED;
    }

    // 3. Iniciar búsqueda
    try {
        // Reacción de inicio
        await conn.sendMessage(m.chat, { react: { text: reactionStart, key: m.key } });

        const vids_ = {
            from: m.sender,
            urls: [],
        };

        if (!global.videoListXXX) {
            global.videoListXXX = [];
        }

        if (global.videoListXXX[0]?.from == m.sender) {
            global.videoListXXX.splice(0, global.videoListXXX.length);
        }

        const res = await xnxxsearch(text);
        const json = res.result;

        let cap = `${SEARCH_TITLE} ${text.toUpperCase()}\n\n`;
        let count = 1;

        for (const v of json) {
            const linkXXX = v.link;
            vids_.urls.push(linkXXX);

            cap += `*[${count}]*\n• *🎬 Titulo:* ${v.title}\n• *🔗 Link:* ${v.link}\n• *❗ Info:* ${v.info}`;
            cap += '\n\n' + '••••••••••••••••••••••••••••••••' + '\n\n';
            count++;
        }

        m.reply(cap);
        global.videoListXXX.push(vids_);

        // Reacción de éxito
        await conn.sendMessage(m.chat, { react: { text: reactionSuccess, key: m.key } });

    } catch (error) {
        // Reacción de error
        await conn.sendMessage(m.chat, { react: { text: reactionError, key: m.key } });
        // Muestra el error de la búsqueda
        throw `❌ Ocurrió un error al realizar la búsqueda.`; 
    }
};

// Se cambió handler.tags a minúsculas
handler.tags = ['nsfw']; 
// Se cambió handler.help a minúsculas
handler.help = ['xnxxsearch'].map((v) => v + ' <query>');
// Se cambió handler.command a minúsculas
handler.command = /^xnxxsearch|xnxxs$/i;
export default handler;

// Función de búsqueda (sin cambios en la lógica)
async function xnxxsearch(query) {
    return new Promise((resolve, reject) => {
        const baseurl = 'https://www.xnxx.com';
        fetch(`${baseurl}/search/${query}/${Math.floor(Math.random() * 3) + 1}`, { method: 'get' })
            .then((res) => res.text())
            .then((res) => {
                const $ = cheerio.load(res, { xmlMode: false });
                const title = [];
                const url = [];
                const desc = [];
                const results = [];
                $('div.mozaique').each(function(a, b) {
                    $(b).find('div.thumb').each(function(c, d) {
                        url.push(baseurl + $(d).find('a').attr('href').replace('/THUMBNUM/', '/'));
                    });
                });
                $('div.mozaique').each(function(a, b) {
                    $(b).find('div.thumb-under').each(function(c, d) {
                        desc.push($(d).find('p.metadata').text());
                        $(d).find('a').each(function(e, f) {
                            title.push($(f).attr('title'));
                        });
                    });
                });
                for (let i = 0; i < title.length; i++) {
                    results.push({ title: title[i], info: desc[i], link: url[i] });
                }
                resolve({ code: 200, status: true, result: results });
            })
            .catch((err) => reject({ code: 503, status: false, result: err }));
    });
}