import {randomBytes} from 'crypto';

const link = /chat.whatsapp.com/;

const handler = async (m, {conn, text, groupMetadata}) => {
  if (m.isBaileys && m.fromMe) {
    return !0;
  }
  if (!m.isGroup) return !1;

  if (!text) {
    // Reacción de error
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      });
    } catch (reactError) {}

    throw '❌ *DEBES INGRESAR UN MENSAJE*\n\nEjemplo: !msg Hola a todos los grupos';
  }

  const linkThisGroup = `${link}`;
  if (m.text.includes(linkThisGroup)) {
    // Reacción de error
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      });
    } catch (reactError) {}

    return conn.reply(m.chat, '❌ *NO SE PERMITEN ENLACES*\n\nNo puedes enviar enlaces de WhatsApp en el mensaje global.', m);
  }

  const time = global.db.data.users[m.sender].msgwait + 300000;
  if (new Date - global.db.data.users[m.sender].msgwait < 300000) {
    const remainingTime = msToTime(time - new Date());

    // Reacción de espera
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '⏳',
          key: m.key
        }
      });
    } catch (reactError) {}

    throw `⏳ *DEBES ESPERAR*\n\nPuedes enviar otro mensaje global en:\n${remainingTime}`;
  }

  const who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
  const name = await conn.getName(m.sender);

  // Obtener todos los grupos donde el bot está presente
  const groups = Object.entries(conn.chats).filter(([jid, chat]) => 
    jid.endsWith('@g.us') && 
    chat.isChats && 
    !chat.metadata?.read_only && 
    !chat.metadata?.announce
  ).map((v) => v[0]);

  if (groups.length === 0) {
    // Reacción de error
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      });
    } catch (reactError) {}

    throw '❌ *NO HAY GRUPOS DISPONIBLES*\n\nEl bot no está en ningún grupo donde pueda enviar mensajes.';
  }

  // Reacción de envío
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '📢',
        key: m.key
      }
    });
  } catch (reactError) {}

  const teks = `📢 *MENSAJE GLOBAL*\n\n💬 *De:* ${name}\n📞 *Contacto:* https://wa.me/${who.split`@`[0]}\n\n📝 *Mensaje:*\n${text}\n\n_⚡ Enviado a todos los grupos_`;

  let sentCount = 0;
  let errorCount = 0;

  // Enviar mensaje a todos los grupos
  for (const id of groups) {
    try {
      await conn.sendMessage(id, {text: teks});
      sentCount++;
    } catch (error) {
      errorCount++;
      console.log(`Error enviando a ${id}:`, error.message);
    }
  }

  // Actualizar tiempo de espera
  global.db.data.users[m.sender].msgwait = new Date() * 1;

  // Mensaje de confirmación
  const resultMessage = `✅ *MENSAJE ENVIADO*\n\n📊 *Estadísticas:*\n• ✅ Grupos exitosos: ${sentCount}\n• ❌ Grupos con error: ${errorCount}\n• 📨 Total: ${groups.length}\n\n⏰ *Próximo mensaje en:* 5 minutos`;

  // Reacción de éxito
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '✅',
        key: m.key
      }
    });
  } catch (reactError) {}

  conn.reply(m.chat, resultMessage, m);
};

handler.command = /^(msg|mensajeglobal|anuncio|broadcast)$/i;
handler.owner = true;
handler.group = true;
handler.help = ['msg <mensaje>'];

export default handler;

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);

  minutes = (minutes < 10) ? '0' + minutes : minutes;
  seconds = (seconds < 10) ? '0' + seconds : seconds;

  return `${minutes}:${seconds}`;
}

const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);
const randomID = (length) => randomBytes(Math.ceil(length * .5)).toString('hex').slice(0, length);