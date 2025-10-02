import fs from "fs"

async function handler(m, {usedPrefix}) {
    const user = m.sender.split("@")[0]

    // Reacción de proceso
    try {
        await conn.sendMessage(m.chat, {
            react: {
                text: '🔑',
                key: m.key
            }
        });
    } catch (reactError) {}

    if (fs.existsSync("./jadibts/" + user + "/creds.json")) {
        let token = Buffer.from(fs.readFileSync("./jadibts/" + user + "/creds.json"), "utf-8").toString("base64")
        await m.reply('🔑 *TOKEN DE SESIÓN*\n\nAquí está tu token de sesión:')
        await m.reply(token)

        // Reacción de éxito
        try {
            await conn.sendMessage(m.chat, {
                react: {
                    text: '✅',
                    key: m.key
                }
            });
        } catch (reactError) {}
    } else {
        // Reacción de error
        try {
            await conn.sendMessage(m.chat, {
                react: {
                    text: '❌',
                    key: m.key
                }
            });
        } catch (reactError) {}

        await m.reply(`❌ *NO TIENES SESIÓN ACTIVA*\n\nUsa el comando *${usedPrefix}jadibot* para generar una nueva sesión.`)
    }
}
handler.command = handler.help = ['token', 'gettoken', 'serbottoken', 'mistoken'];
handler.tags = ['jadibot'];
handler.private = true
export default handler;