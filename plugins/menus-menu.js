import { promises as fs } from 'fs';
import { join } from 'path';

const handler = async (m, { conn, usedPrefix, __dirname, isPrems }) => {
    try {
        const username = '@' + m.sender.split('@s.whatsapp.net')[0];
        if (usedPrefix == 'a' || usedPrefix == 'A') return;

        // Reacción del menú
        try {
            await conn.sendMessage(m.chat, {
                react: {
                    text: '📱',
                    key: m.key
                }
            });
        } catch (reactError) {}

        const more = String.fromCharCode(8206);
        const readMore = more.repeat(4001);

        const d = new Date(new Date().getTime() + 3600000);

        let week, date;
        try {
            week = d.toLocaleDateString('es-ES', { weekday: 'long' });
            date = d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch (error) {
            week = 'Desconocido';
            date = 'Desconocido';
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

        // Comandos organizados
        const extrasCommands = {
            'info': [
                `${usedPrefix}lang`,
                `${usedPrefix}infobot`,
                `${usedPrefix}estado`,
                `${usedPrefix}ds`,
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
                `${usedPrefix}mates <nivel>`,
                `${usedPrefix}ppt <opción>`,
                `${usedPrefix}ttt`,
                `${usedPrefix}delttt`
            ],
            'group': [
                `${usedPrefix}enable welcome`,
                `${usedPrefix}disable welcome`,
                `${usedPrefix}enable antilink`,
                `${usedPrefix}disable antilink`,
                `${usedPrefix}enable detect`,
                `${usedPrefix}disable detect`
            ],
            'downloader': [
                `${usedPrefix}ytmp3 <url>`,
                `${usedPrefix}ytmp4 <url>`,
                `${usedPrefix}facebook <url>`,
                `${usedPrefix}instagram <url>`,
                `${usedPrefix}tiktok <url>`,
                `${usedPrefix}twitter <url>`
            ],
            'search': [
                `${usedPrefix}peli <text>`
            ],
            'tools': [
                `${usedPrefix}chatgpt <txt>`,
                `${usedPrefix}clima <lugar>`,
                `${usedPrefix}readqr <img>`,
                `${usedPrefix}del <msj>`
            ],
            'converter': [
                `${usedPrefix}toptt <video/audio>`
            ],
            'owner': [
                `${usedPrefix}autoadmin`,
                `${usedPrefix}addowner <@user>`,
                `${usedPrefix}borrarowner <@user>`,
                `${usedPrefix}block <@user>`,
                `${usedPrefix}unblock <@user>`,
                `${usedPrefix}banuser <@user>`,
                `${usedPrefix}dardiamantes <@user> <cant>`,
                `${usedPrefix}añadirxp <@user> <cant>`,
                `${usedPrefix}bcbot <txt>`
            ]
        };

        const borderedTags = {
            'info': '📱 MENÚ PRINCIPAL 📱',
            'jadibot': '🤖 JADIBOT',
            'xp': '✨ NIVELES Y ECONOMÍA',
            'game': '🎮 JUEGOS',
            'group': '👥 GRUPO',
            'downloader': '📥 DESCARGAS',
            'search': '🔍 BÚSQUEDA',
            'tools': '🛠️ HERRAMIENTAS',
            'converter': '🔄 CONVERTIDORES',
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
╭━━〔 ${borderedTags[tag]} 〕━━╮
┃
${allCommands.split('\n').map(cmd => `┃ ➡️ ${cmd}`).join('\n')}
┃
╰━━━━━━━━━━━━━━━━━━━━╯
`.trim();
            }
            return '';
        }).filter(section => section !== '');

        const infoBotSection = `
╭━━〔 ℹ️ INFO DEL BOT ℹ️ 〕━━╮
┃
┃ ➡️ Creador: ${global.author || 'KARBOT-MD'}
┃ ➡️ Contacto: wa.me/${global.owner?.[0]?.[0] || '0'}
┃ ➡️ Actividad: ${uptime}
┃ ➡️ Usuarios: ${rtotal}
┃ ➡️ Registrados: ${rtotalreg}
┃
╰━━━━━━━━━━━━━━━━━━━━╯
`.trim();

        const infoUserSection = `
╭━━〔 👤 INFO DEL USUARIO 👤 〕━━╮
┃
┃ ➡️ Usuario: ${username}
┃ ➡️ Nivel: ${level}
┃ ➡️ Rol: ${role}
┃ ➡️ XP: ${exp}
┃ ➡️ Diamantes: ${limit}
┃ ➡️ Dinero: ${money}
┃ ➡️ Premium: ${isPremium ? '✅' : '❌'}
┃
╰━━━━━━━━━━━━━━━━━━━━╯
`.trim();

        const mainHeader = `
╭━━〔 🔥 KARBOT-MD 🔥 〕━━╮
┃
┃ ➡️ Hola, ${username}
┃ ➡️ Fecha: ${week}, ${date}
┃
╰━━━━━━━━━━━━━━━━━━━━╯
`.trim();

        const fullText = [
            mainHeader,
            infoBotSection,
            infoUserSection,
            ...menuSections,
            `🔥 *KARBOT-MD* - Tu asistente personal 🔥`
        ].join('\n\n');

        const imageUrl = 'https://qu.ax/JCgKF.png';

        await conn.sendMessage(m.chat, {
            image: { url: imageUrl },
            caption: fullText,
            mentions: [m.sender]
        }, { quoted: m });

    } catch (e) {
        console.error('Error en menú:', e);
        await m.reply('❌ *ERROR AL CARGAR EL MENÚ*\n\nIntenta nuevamente.');
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