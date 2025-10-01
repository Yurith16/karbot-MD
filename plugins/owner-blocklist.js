const handler = async (m, {conn}) => {
  await conn.fetchBlocklist().then(async (data) => {
    // Reacción de lista
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '📋',
          key: m.key
        }
      });
    } catch (reactError) {}

    if (data.length === 0) {
      return conn.reply(m.chat, 
        `📭 *LISTA DE BLOQUEADOS VACÍA*\n\nNo hay usuarios bloqueados en este momento.`, 
        m
      );
    }

    let txt = `🚫 *LISTA DE BLOQUEADOS*\n\n*Total:* ${data.length} usuario(s)\n\n┌──「 📋 USUARIOS 」\n`;

    for (const i of data) {
      txt += `│ ▸ @${i.split('@')[0]}\n`;
    }

    txt += '└──────────────';

    return conn.reply(m.chat, txt, m, {mentions: await conn.parseMention(txt)});

  }).catch((err) => {
    console.log(err);

    // Reacción de error
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      });
    } catch (reactError) {}

    throw '❌ *ERROR AL OBTENER LISTA*\n\nNo se pudo obtener la lista de usuarios bloqueados.';  
  });
};

handler.help = ['blocklist'];
handler.tags = ['owner'];
handler.command = /^(blocklist|listabloqueados|listablock|listabloqueos)$/i;
handler.rowner = true;

export default handler;