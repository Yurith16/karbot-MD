/* Desarrollado y Creado por: HERNANDEZ - KARBOT-MD */

import axios from "axios";
import cheerio from "cheerio";
import { generateWAMessageFromContent } from "baileys";

const handler = async (m, { conn, text, args, usedPrefix, command }) => {
    // Sistema de reacción - Indicar que el comando fue detectado
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    if (!text) {
        await conn.sendMessage(m.chat, { 
            text: `> 🜸 *agrega un enlace* » ingresa un enlace de tiktok\n> 🜸 *ejemplo* » ${usedPrefix + command} https://vt.tiktok.com/ZSSm2fhLX/` 
        }, { quoted: m });
        return;
    }

    if (!/(?:https:?\/{2})?(?:w{3}|vm|vt|t)?\.?tiktok.com\/([^\s&]+)/gi.test(text)) {
        await conn.sendMessage(m.chat, { 
            text: `> 🜸 *enlace inválido* » ingresa un enlace válido de tiktok\n> 🜸 *ejemplo* » ${usedPrefix + command} https://vt.tiktok.com/ZSSm2fhLX/` 
        }, { quoted: m });
        return;
    }

    try {
        // Cambiar reacción a "procesando"
        await conn.sendMessage(m.chat, { react: { text: "📥", key: m.key } });

        const links = await fetchDownloadLinks(args[0], "tiktok", conn, m);
        if (!links) throw new Error("> 🜸 *error* » no se pudieron obtener enlaces");
        const download = getDownloadLink("tiktok", links);
        if (!download) throw new Error("> 🜸 *error* » no se pudo obtener enlace de descarga");
        const cap = `> 🜸 *descarga exitosa* »`;

        // Cambiar reacción a "enviando"
        await conn.sendMessage(m.chat, { react: { text: "📤", key: m.key } });

        await conn.sendMessage(
            m.chat,
            { video: { url: download }, caption: cap },
            { quoted: m },
        );

        // Reacción de éxito
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } catch (error) {
        // Reacción de error
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        await conn.sendMessage(m.chat, { 
            text: `> 🜸 *error* » no se pudo descargar el video\n> 🜸 *solución* » verifica que el enlace sea válido` 
        }, { quoted: m });
    }
};

handler.command = /^(tiktok|tk|tiktokdl|tiktoknowm|tt|ttnowm|tiktokaudio)$/i;
export default handler;

async function fetchDownloadLinks(text, platform, conn, m) {
    const { SITE_URL, form } = createApiRequest(text, platform);
    const res = await axios.post(`${SITE_URL}api`, form.toString(), {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            Origin: SITE_URL,
            Referer: SITE_URL,
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "X-Requested-With": "XMLHttpRequest",
        },
    });
    const html = res?.data?.html;
    if (!html || res?.data?.status !== "success") {
        return null;
    }
    const $ = cheerio.load(html);
    const links = [];
    $('a.btn[href^="http"]').each((_, el) => {
        const link = $(el).attr("href");
        if (link && !links.includes(link)) {
            links.push(link);
        }
    });
    return links;
}

function createApiRequest(text, platform) {
    const SITE_URL = "https://instatiktok.com/";
    const form = new URLSearchParams();
    form.append("url", text);
    form.append("platform", platform);
    form.append("siteurl", SITE_URL);
    return { SITE_URL, form };
}

function getDownloadLink(platform, links) {
    if (platform === "tiktok") {
        return links.find((link) => /hdplay/.test(link)) || links[0];
    }
    return null;
}