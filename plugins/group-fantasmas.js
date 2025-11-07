const handler = async (m, { conn, participants }) => {
  try {
    // Verificación manual sin usar dfail
    if (!m.isGroup) {
      return await conn.sendMessage(m.chat, {
        text: `*「❌」 Comando Grupal*\n\n> ✦ *Este comando solo funciona en grupos*`
      }, { quoted: m });
    }

    // Verificar si es admin manualmente
    const sender = m.sender;
    const isAdmin = participants.find(p => p.id === sender)?.admin;
    const isBotAdmin = participants.find(p => p.id === conn.user.jid)?.admin;

    if (!isAdmin) {
      return await conn.sendMessage(m.chat, {
        text: `*「❌」 Permisos Insuficientes*\n\n> ✦ *Solo administradores pueden usar este comando*`
      }, { quoted: m });
    }

    if (!isBotAdmin) {
      return await conn.sendMessage(m.chat, {
        text: `*「❌」 Bot No Admin*\n\n> ✦ *Necesito ser administrador para usar este comando*`
      }, { quoted: m });
    }

    // Reacción de fantasmita al iniciar
    await conn.sendMessage(m.chat, {
      react: { text: '👻', key: m.key }
    });

    const members = participants.map(u => u.id);
    let total = 0;
    const sider = [];

    for (let i = 0; i < members.length; i++) {
      const user = participants.find(u => u.id == members[i]);
      
      // Verificar si el usuario no ha interactuado con el bot y no es admin
      if ((typeof global.db.data.users[members[i]] == 'undefined' || 
           global.db.data.users[members[i]].chat == 0) && 
          !user?.admin && !user?.isSuperAdmin) {
        
        if (typeof global.db.data.users[members[i]] !== 'undefined') {
          if (global.db.data.users[members[i]].whitelist == false) {
            total++;
            sider.push(members[i]);
          }
        } else {
          total++;
          sider.push(members[i]);
        }
      }
    }

    const groupName = await conn.getName(m.chat);

    if (total == 0) {
      // Reacción de check cuando no hay fantasmas
      await conn.sendMessage(m.chat, {
        react: { text: '✅', key: m.key }
      });
      
      return await conn.sendMessage(m.chat, {
        image: { url: 'https://files.catbox.moe/sjhtvx.png' },
        caption: `*「✅」 Grupo Activo*\n\n> ✦ *Grupo:* » ${groupName}\n> ✦ *Miembros:* » ${members.length}\n> ✦ *Estado:* » Todos han interactuado con el bot`
      }, { quoted: m });
    }

    // Reacción de advertencia cuando hay fantasmas
    await conn.sendMessage(m.chat, {
      react: { text: '⚠️', key: m.key }
    });

    // Enviar imagen con etiquetas
    await conn.sendMessage(m.chat, {
      image: { url: 'https://files.catbox.moe/sjhtvx.png' },
      caption: `${sider.map((v, i) => `@${v.replace(/@.+/, '')}`).join(' ')}\n\n*「👻」 Usuarios inactivos detectados: ${total}*`,
      mentions: sider
    }, { quoted: m });

  } catch (error) {
    console.error('Error en comando fantasmas:', error);
    
    // Reacción de error
    await conn.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    });
    
    await conn.sendMessage(m.chat, {
      text: `*「❌」 Error*\n\n> ✦ *Error:* » ${error.message}`
    }, { quoted: m });
  }
};

handler.help = ['fantasmas'];
handler.tags = ['group'];
handler.command = /^(verfantasmas|fantasmas|sider|inactivos|fantasma)$/i;

export default handler;