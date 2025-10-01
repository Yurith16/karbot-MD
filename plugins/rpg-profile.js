import {createHash} from 'crypto';
import PhoneNumber from 'awesome-phonenumber';
import fetch from 'node-fetch';

const handler = async (m, {conn, usedPrefix, participants, isPrems}) => {
  let texto = await m.mentionedJid;
  let who = texto.length > 0 ? texto[0] : (m.quoted ? await m.quoted.sender : m.sender);

  if (!(who in global.db.data.users)) throw '❌ *USUARIO NO ENCONTRADO*\n\nEl usuario no está registrado en la base de datos.';

  try {
    const pp = await conn.profilePictureUrl(who, 'image').catch(_ => 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60');
    const user = global.db.data.users[who];
    const {name, limit, lastclaim, registered, regTime, age, premiumTime, exp, money} = user;
    const username = conn.getName(who);
    const prem = global.prems.includes(who.split`@`[0]);
    const sn = createHash('md5').update(who).digest('hex');

    const str = `┌──「 👤 PERFIL DE USUARIO 」
│ 
│ 📛 *Nombre:* ${username} ${registered ? '(' + name + ')' : ''}
│ 📞 *Número:* ${PhoneNumber('+' + who.replace('@s.whatsapp.net', '')).getNumber('international')}
│ 🔗 *WhatsApp:* wa.me/${who.split`@`[0]}
│ ${registered ? `🎂 *Edad:* ${age} años` : ''}
│ 
│ 💎 *Diamantes:* ${limit}
│ ⭐ *Experiencia:* ${exp}
│ 💰 *Dinero:* $${money}
│ 
│ ✅ *Registrado:* ${registered ? 'SÍ' : 'NO'}
│ ⭐ *Premium:* ${premiumTime > 0 ? 'SÍ' : 'NO'}
│ 
│ 🔐 *Número de serie:*
│ ${sn}
└──────────────`.trim();

    // Sistema de reacción
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '👤',
          key: m.key
        }
      });
    } catch (reactError) {
      // Ignorar error de reacción
    }

    await conn.sendMessage(m.chat, {
      image: {url: pp},
      caption: str
    }, {quoted: m});

  } catch (error) {
    console.log(error);
    // Reacción de error
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      });
    } catch (reactError) {}

    throw '❌ *ERROR AL CARGAR EL PERFIL*\n\nIntenta nuevamente.';
  }
};

handler.help = ['profile'];
handler.tags = ['xp'];
handler.command = /^perfil|profile?$/i;

export default handler;
