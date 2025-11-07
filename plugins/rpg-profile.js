import { createHash } from 'crypto';
import PhoneNumber from 'awesome-phonenumber';

const handler = async (m, { conn, usedPrefix }) => {
  const who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender;

  if (!(who in global.db.data.users)) {
    return await conn.sendMessage(m.chat, {
      text: `*「❌」 Usuario No Encontrado*\n\n> ✦ *El usuario no está en la base de datos*`
    }, { quoted: m });
  }

  try {
    const pp = await conn.profilePictureUrl(who, 'image').catch(_ => null);
    const user = global.db.data.users[who];
    const { name, limit, exp, money, registered, age, premiumTime } = user;
    const username = conn.getName(who);
    const prem = global.prems.includes(who.split`@`[0]);
    const sn = createHash('md5').update(who).digest('hex');
    const phoneNumber = PhoneNumber('+' + who.replace('@s.whatsapp.net', '')).getNumber('international');

    // Calcular nivel basado en experiencia
    const nivel = Math.floor(Math.sqrt(exp / 100)) + 1;
    const xpParaSiguienteNivel = Math.pow(nivel, 2) * 100;
    const xpActual = exp - (Math.pow(nivel - 1, 2) * 100);
    const porcentajeNivel = Math.min((xpActual / (xpParaSiguienteNivel - (Math.pow(nivel - 1, 2) * 100))) * 100, 100);

    // Crear barra de progreso
    function crearBarraProgreso(porcentaje, longitud = 10) {
      const progreso = Math.round((porcentaje / 100) * longitud);
      return '█'.repeat(progreso) + '░'.repeat(longitud - progreso);
    }

    const barraProgreso = crearBarraProgreso(porcentajeNivel);

    const perfilMessage = `
*「👤」 Perfil de ${username}*

📊 *ESTADÍSTICAS*
├─ 🏆 Nivel ${nivel}
├─ ${barraProgreso} ${Math.round(porcentajeNivel)}%
├─ ⭐ ${exp.toLocaleString()} XP
├─ 💎 ${limit} Diamantes
├─ 💰 $${money.toLocaleString()}

👤 *INFORMACIÓN*
├─ 📛 ${registered ? name : 'No registrado'}
├─ ${registered ? `🎂 ${age} años` : '📝 Usa .reg para registrarte'}
├─ 📞 ${phoneNumber}
├─ ${premiumTime > 0 ? '⭐ Premium' : '🔓 Usuario regular'}

🔐 *IDENTIFICACIÓN*
├─ 🆔 ${sn.substring(0, 8)}...
`.trim();

    // Reacción
    await conn.sendMessage(m.chat, {
      react: { text: '👤', key: m.key }
    });

    // Enviar mensaje con imagen de perfil si está disponible
    if (pp) {
      await conn.sendMessage(m.chat, {
        image: { url: pp },
        caption: perfilMessage
      }, { quoted: m });
    } else {
      await conn.sendMessage(m.chat, {
        text: perfilMessage
      }, { quoted: m });
    }

  } catch (error) {
    console.error('Error en perfil:', error);

    await conn.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    });

    await conn.sendMessage(m.chat, {
      text: `*「❌」 Error al Cargar Perfil*\n\n> ✦ *Error:* ${error.message}`
    }, { quoted: m });
  }
};

handler.help = ['perfil'];
handler.tags = ['xp'];
handler.command = /^perfil|profile?$/i;

export default handler;