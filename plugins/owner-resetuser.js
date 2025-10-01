const handler = async (m, { conn, text }) => {
    const numberPattern = /\d+/g;
    let user = '';

    // Obtener el usuario de diferentes formas
    const numberMatches = text.match(numberPattern);
    if (numberMatches) {
        const number = numberMatches.join('');
        user = number + '@s.whatsapp.net';
    } else if (m.quoted && m.quoted.sender) {
        const quotedNumberMatches = m.quoted.sender.match(numberPattern);
        if (quotedNumberMatches) {
            const number = quotedNumberMatches.join('');
            user = number + '@s.whatsapp.net';
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

            return conn.sendMessage(m.chat, { 
                text: `┌──「 ❌ USUARIO NO VÁLIDO 」
│
│ El usuario citado no tiene un
│ número de teléfono válido.
│ 
│ 💡 Formas de especificar usuario:
│ ➺ !resetuser 123456789
│ ➺ Responde a un mensaje con !resetuser
└──────────────` 
            }, { quoted: m });
        }
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

        return conn.sendMessage(m.chat, { 
            text: `┌──「 ❌ FALTA USUARIO 」
│
│ Debes especificar un usuario:
│ 
│ 📝 Ejemplos:
│ ➺ !resetuser 123456789
│ ➺ Responde a un mensaje con !resetuser
│ 
│ 👤 Puedes usar:
│ • Número de teléfono
│ • Mensaje citado de usuario
└──────────────` 
        }, { quoted: m });
    }

    const userNumber = user.split('@')[0];

    // Verificar si el usuario existe en la base de datos
    if (!global.db.data.users[user] || global.db.data.users[user] == '') {
        // Reacción de error
        try {
            await conn.sendMessage(m.chat, {
                react: {
                    text: '❌',
                    key: m.key
                }
            });
        } catch (reactError) {}

        return conn.sendMessage(m.chat, { 
            text: `┌──「 ❌ USUARIO NO ENCONTRADO 」
│
│ @${userNumber} no está registrado
│ en la base de datos.
│ 
│ 📊 No hay datos que eliminar
│ 
│ 🔍 Verifica el número e intenta nuevamente
└──────────────`, 
            mentions: [user] 
        }, { quoted: m });
    }

    // Eliminar datos del usuario
    delete global.db.data.users[user];

    // Reacción de éxito
    try {
        await conn.sendMessage(m.chat, {
            react: {
                text: '✅',
                key: m.key
            }
        });
    } catch (reactError) {}

    conn.sendMessage(m.chat, { 
        text: `┌──「 ✅ DATOS ELIMINADOS 」
│
│ 👤 *Usuario:* @${userNumber}
│ 🗑️ *Acción:* Datos eliminados
│ 
│ 📊 Se han borrado todos los datos
│ del usuario de la base de datos.
│ 
│ 🔄 El usuario puede volver a
│ registrarse desde cero
└──────────────`, 
        mentions: [user] 
    }, { quoted: m });
};

handler.tags = ['owner'];
handler.command = /^(restablecerdatos|deletedatauser|resetuser|eliminardatos|resetearusuario)$/i;
handler.rowner = true;
handler.help = ['resetuser'];

export default handler;