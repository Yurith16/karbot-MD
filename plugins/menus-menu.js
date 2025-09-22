import { promises as fs } from 'fs';
import { join } from 'path';

const handler = async (m, { conn, usedPrefix, __dirname, isPrems }) => {
    const idioma = global.db.data.users[m.sender]?.language || global.defaultLenguaje || 'es';
    const _translate = JSON.parse(await fs.readFile(`./src/languages/${idioma}/${m.plugin}.json`));
    const tradutor = _translate.plugins.menu;

    try {
        const username = '@' + m.sender.split('@s.whatsapp.net')[0];
        if (usedPrefix == 'a' || usedPrefix == 'A') return;

        const more = String.fromCharCode(8206);
        const readMore = more.repeat(4001);

        const d = new Date(new Date().getTime() + 3600000);

        const localeMap = {
            'es': 'es-ES',
            'en': 'en-US',
            'ar': 'ar-SA'
        };

        const locale = localeMap[idioma.toLowerCase()] || 'es-ES';

        let week, date;
        try {
            week = d.toLocaleDateString(locale, { weekday: 'long' });
            date = d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch (error) {
            week = d.toLocaleDateString('es-ES', { weekday: 'long' });
            date = d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }

        const _uptime = process.uptime() * 1000;
        const uptime = clockString(_uptime);
        const rtotalreg = Object.values(global.db.data.users).filter(user => user.registered == true).length;
        const rtotal = Object.keys(global.db.data.users).length || '0';

        const user = global.db.data.users[m.sender];
        const exp = user.exp ? user.exp : 0;
        const limit = user.limit ? user.limit : 0;
        const level = user.level ? user.level : 0;
        const role = user.role ? user.role : 'Nuevo';
        const money = user.money ? user.money : 0;
        const joincount = user.joincount ? user.joincount : 0;
        const isPremium = user.premiumTime > 0 || isPrems;

        // Comando que tienes en tu código original
        const extrasCommands = {
            'info': [
                `${usedPrefix}menuaudios`,
                `${usedPrefix}menuanimes`,
                `${usedPrefix}labiblia`,
                `${usedPrefix}lang`,
                `${usedPrefix}infobot`,
                `${usedPrefix}script`,
                `${usedPrefix}estado`,
                `${usedPrefix}join <wagp_url>`,
                `${usedPrefix}fixmsgespera`,
                `bot (sin prefijo)`
            ],
            'jadibot': [
                `${usedPrefix}serbot --code`
            ],
            'xp': [
                `${usedPrefix}cofre`,
                `${usedPrefix}balance`,
                `${usedPrefix}claim`,
                `${usedPrefix}lb`,
                `${usedPrefix}myns`,
                `${usedPrefix}perfil`,
                `${usedPrefix}crime`
            ],
            'game': [
                `${usedPrefix}mates <noob/easy/medium/hard/extreme/impossible/impossible2>`,
                `${usedPrefix}ppt <papel/tijera/piedra>`,
                `${usedPrefix}suitpvp <@tag>`,
                `${usedPrefix}ttt`,
                `${usedPrefix}delttt`,
                `${usedPrefix}akinator`,
                `${usedPrefix}wordfind`,
                `${usedPrefix}cancion`,
                `${usedPrefix}pista`,
                `${usedPrefix}glx (RPG Mundo)`,
                `${usedPrefix}doxear <nombre / @tag>`
            ],
            'group': [
                `${usedPrefix}grouptime <tiempo>`,
                `${usedPrefix}enable welcome`,
                `${usedPrefix}disable welcome`,
                `${usedPrefix}enable modohorny`,
                `${usedPrefix}disable modohorny`,
                `${usedPrefix}enable antilink`,
                `${usedPrefix}disable antilink`,
                `${usedPrefix}enable antilink2`,
                `${usedPrefix}disable antilink2`,
                `${usedPrefix}enable detect`,
                `${usedPrefix}disable detect`,
                `${usedPrefix}enable audios`,
                `${usedPrefix}disable audios`,
                `${usedPrefix}enable autosticker`,
                `${usedPrefix}disable autosticker`,
                `${usedPrefix}enable antiviewonce`,
                `${usedPrefix}disable antiviewonce`,
                `${usedPrefix}enable antitoxic`,
                `${usedPrefix}disable antitoxic`,
                `${usedPrefix}enable antitraba`,
                `${usedPrefix}disable antitraba`,
                `${usedPrefix}enable antiarabes`,
                `${usedPrefix}disable antiarabes`,
                `${usedPrefix}enable modoadmin`,
                `${usedPrefix}disable modoadmin`,
                `${usedPrefix}enable antidelete`,
                `${usedPrefix}disable antidelete`
            ],
            'downloader': [
                `${usedPrefix}spotify <txt>`,
                `${usedPrefix}playdoc <txt>`,
                `${usedPrefix}ytmp3doc <url>`,
                `${usedPrefix}ytmp4doc <url>`,
                `${usedPrefix}facebook <url>`,
                `${usedPrefix}instagram <url>`,
                `${usedPrefix}tiktok <url>`,
                `${usedPrefix}tiktokimg <url>`,
                `${usedPrefix}pptiktok <usr>`,
                `${usedPrefix}mediafire <url>`,
                `${usedPrefix}gitclone <url>`,
                `${usedPrefix}gdrive <url>`,
                `${usedPrefix}twitter <url>`,
                `${usedPrefix}ringtone <txt>`,
                `${usedPrefix}soundcloud <txt>`,
                `${usedPrefix}stickerpack <url>`,
                `${usedPrefix}dapk2 <url}`
            ],
            'search': [
                `${usedPrefix}modapk <txt>`,
                `${usedPrefix}stickersearch <txt>`,
                `${usedPrefix}stickersearch2 <txt>`,
                `${usedPrefix}animeinfo <txt>`,
                `${usedPrefix}cuevana <text>`,
                `${usedPrefix}cuevanaInfo <link>`
            ],
            'effects': [
                `${usedPrefix}logos <efecto> <txt>`,
                `${usedPrefix}logochristmas <txt}`,
                `${usedPrefix}logocorazon <txt}`,
                `${usedPrefix}pixelar`
            ],
            'img': [
                `${usedPrefix}wpmontaña`,
                `${usedPrefix}pubg`,
                `${usedPrefix}wpgaming`,
                `${usedPrefix}wpaesthetic`,
                `${usedPrefix}wpaesthetic2`,
                `${usedPrefix}wprandom`,
                `${usedPrefix}wallhp`,
                `${usedPrefix}wpvehiculo`,
                `${usedPrefix}wpmoto`,
                `${usedPrefix}coffee`,
                `${usedPrefix}pentol`,
                `${usedPrefix}caricatura`,
                `${usedPrefix}ciberespacio`,
                `${usedPrefix}technology`,
                `${usedPrefix}doraemon`,
                `${usedPrefix}hacker`,
                `${usedPrefix}planeta`,
                `${usedPrefix}randomprofile`
            ],
            'tools': [
                `${usedPrefix}ocr`,
                `${usedPrefix}inspect <wagc_url>`,
                `${usedPrefix}chatgpt <txt>`,
                `${usedPrefix}exploit <txt>`,
                `${usedPrefix}dall-e <txt>`,
                `${usedPrefix}spamwa <num|txt|cant>`,
                `${usedPrefix}readviewonce <img/video>`,
                `${usedPrefix}clima <país> <ciudad>`,
                `${usedPrefix}encuesta <txt1|txt2>`,
                `${usedPrefix}whatmusic <audio>`,
                `${usedPrefix}readqr <img>`,
                `${usedPrefix}styletext <txt>`,
                `${usedPrefix}nowa <num>`,
                `${usedPrefix}covid <pais>`,
                `${usedPrefix}horario`,
                `${usedPrefix}igstalk <usr>`,
                `${usedPrefix}del <msj>`
            ],
            'converter': [
                `${usedPrefix}toptt <video / audio>`
            ],
            'sticker': [
                `${usedPrefix}scircle <img>`,
                `${usedPrefix}sremovebg <img>`,
                `${usedPrefix}semoji <tipo> <emoji>`,
                `${usedPrefix}attp2 <txt>`,
                `${usedPrefix}attp3 <txt>`,
                `${usedPrefix}ttp2 <txt>`,
                `${usedPrefix}ttp3 <txt>`,
                `${usedPrefix}ttp4 <txt>`,
                `${usedPrefix}ttp5 <txt>`,
                `${usedPrefix}slap <@tag>`,
                `${usedPrefix}pat <@tag>`,
                `${usedPrefix}kiss <@tag>`,
                `${usedPrefix}dado`,
                `${usedPrefix}stickermarker <efecto> <img>`,
                `${usedPrefix}stickerfilter <efecto> <img>`
            ],
            'owner': [
                `${usedPrefix}dsowner`,
                `${usedPrefix}autoadmin`,
                `${usedPrefix}leavegc`,
                `${usedPrefix}addowner <@tag / num>`,
                `${usedPrefix}delowner <@tag / num>`,
                `${usedPrefix}block <@tag / num>`,
                `${usedPrefix}unblock <@tag / num>`,
                `${usedPrefix}enable restrict`,
                `${usedPrefix}disable restrict`,
                `${usedPrefix}enable autoread`,
                `${usedPrefix}disable autoread`,
                `${usedPrefix}enable public`,
                `${usedPrefix}disable public`,
                `${usedPrefix}enable pconly`,
                `${usedPrefix}disable pconly`,
                `${usedPrefix}enable gconly`,
                `${usedPrefix}disable gconly`,
                `${usedPrefix}enable anticall`,
                `${usedPrefix}disable anticall`,
                `${usedPrefix}enable antiprivado`,
                `${usedPrefix}disable antiprivado`,
                `${usedPrefix}enable modejadibot`,
                `${usedPrefix}disable modejadibot`,
                `${usedPrefix}enable audios_bot`,
                `${usedPrefix}disable audios_bot`,
                `${usedPrefix}enable antispam`,
                `${usedPrefix}disable antispam`,
                `${usedPrefix}resetuser <@tag>`,
                `${usedPrefix}banuser <@tag>`,
                `${usedPrefix}dardiamantes <@tag> <cant>`,
                `${usedPrefix}añadirxp <@tag> <cant>`,
                `${usedPrefix}bcbot <txt>`,
                `${usedPrefix}cleartpm`,
                `${usedPrefix}banlist`,
                `${usedPrefix}addprem2 <@tag> <time>`,
                `${usedPrefix}addprem3 <@tag> <time>`,
                `${usedPrefix}addprem4 <@tag> <time>`,
                `${usedPrefix}listcmd`,
                `${usedPrefix}addcmd <txt>`,
                `${usedPrefix}delcmd`,
                `${usedPrefix}msg <txt>`,
                `${usedPrefix}setppbot <reply to img>`
            ]
        };

        const tags = tradutor.tags || {};

        const borderedTags = {
            'info': '📱 MENÚ PRINCIPAL 📱',
            'jadibot': '🤖 JADIBOT',
            'xp': '✨ NIVELES Y ECONOMÍA',
            'game': '🎮 JUEGOS',
            'group': '👥 GRUPO',
            'downloader': '📥 DESCARGAS',
            'search': '🔍 BÚSQUEDA',
            'effects': '🎨 EFECTOS',
            'img': '🖼️ IMÁGENES',
            'tools': '🛠️ HERRAMIENTAS',
            'converter': '🔄 CONVERTIDORES',
            'sticker': '🎭 STICKERS',
            'owner': '👑 OWNER'
        };

        const help = Object.values(global.plugins).filter(plugin => !plugin.disabled).map(plugin => {
            return {
                help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
                tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
                prefix: 'customPrefix' in plugin,
                limit: plugin.limit,
                enabled: !plugin.disabled,
            }
        });

        const menuSections = Object.keys(borderedTags).map(tag => {
            const commandsInTag = help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help).map(menu => {
                return menu.help.map(h => `${usedPrefix}` + h).join('\n');
            }).join('\n');

            const extraCommandsInTag = extrasCommands[tag] ? extrasCommands[tag].join('\n') : '';

            const allCommands = [commandsInTag, extraCommandsInTag].filter(Boolean).join('\n');

            if (allCommands) {
                return `
╭━━〔${borderedTags[tag]}〕━━╮
┃
${allCommands.split('\n').map(cmd => `┃ ➡️ ${cmd}`).join('\n')}
┃
╰═┄═┄┄═┄═┄═┄═┄═┄═┄═┄═╯
`.trim();
            }
            return '';
        }).filter(section => section !== '');

        const infoBotSection = `
╭━━〔 ℹ️ INFO DEL BOT ℹ️ 〕━━╮
┃
┃ ➡️ Creador: ${global.author || 'Desconocido'}
┃ ➡️ Contacto: wa.me/${global.owner?.[0]?.[0] || '0'}
┃ ➡️ Actividad: ${uptime}
┃ ➡️ Usuarios totales: ${rtotal}
┃ ➡️ Registrados: ${rtotalreg}
┃
╰═┄═┄┄═┄═┄═┄═┄═┄═┄═┄═╯
`.trim();

        const infoUserSection = `
╭━━〔 ℹ️ INFO DEL USUARIO ℹ️ 〕━━╮
┃
┃ ➡️ Usuario: ${username}
┃ ➡️ Nivel: ${level}
┃ ➡️ Rol: ${role}
┃ ➡️ XP: ${exp}
┃ ➡️ Diamantes: ${limit}
┃ ➡️ Dinero: ${money}
┃ ➡️ Premium: ${isPremium ? '✅' : '❌'}
┃
╰═┄═┄┄═┄═┄═┄═┄═┄═┄═┄═╯
`.trim();

        const mainHeader = `
╭━━〔 🔥 KARBOT 🔥 〕━━╮
┃
┃ ➡️ Hola, ${username}
┃ ➡️ Fecha: ${week}, ${date}
┃
╰═┄═┄┄═┄═┄═┄═┄═┄═┄═┄═╯
`.trim();

        const fullText = [
            mainHeader,
            infoBotSection,
            infoUserSection,
            ...menuSections,
            `🔥 Karbot - Tu bot personal 🔥`
        ].join('\n\n');

        const imageUrl = 'https://qu.ax/JCgKF.png'; 

        await conn.sendMessage(m.chat, {
            image: { url: imageUrl },
            caption: fullText,
            mentions: [m.sender]
        }, { quoted: m });

    } catch (e) {
        await m.reply(`${tradutor?.error_message} ${e.message}`);
    }
};

handler.help = ['menu'];
handler.tags = ['info'];
handler.command = /^(menu|help|comandos|commands|cmd|cmds)$/i;
export default handler;

function clockString(ms) {
    const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000);
    const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
    const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
}