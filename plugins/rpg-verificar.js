import { createHash } from 'crypto';

const Reg = /\|?(.*)([.|] *?)([0-9]*)$/i;

const handler = async function(m, { conn, text, usedPrefix, command }) {
  const user = global.db.data.users[m.sender];

  if (!user) throw '*❌ USUARIO NO ENCONTRADO EN LA BASE DE DATOS*';

  if (user.registered === true) throw `*¡YA ESTÁS REGISTRADO/A!*\n\nSi deseas eliminar tu registro, usa el comando:\n*${usedPrefix}unreg*`;

  if (!text) throw `*FORMATO INCORRECTO*\n\nUso correcto: *${usedPrefix + command} nombre.edad*\nEjemplo: *${usedPrefix + command} Shadow.18*`;

  if (!Reg.test(text)) throw `*FORMATO INCORRECTO*\n\nUso correcto: *${usedPrefix + command} nombre.edad*\nEjemplo: *${usedPrefix + command} Shadow.18*`;

  let [_, name, splitter, age] = text.match(Reg);

  name = name ? name.trim() : '';
  age = age ? age.trim() : '';

  if (!name) throw '*❌ DEBES INGRESAR UN NOMBRE*';
  if (!age) throw '*❌ DEBES INGRESAR TU EDAD*';
  if (name.length >= 30) throw '*❌ EL NOMBRE ES DEMASIADO LARGO*';

  age = parseInt(age);
  if (isNaN(age)) throw '*❌ LA EDAD DEBE SER UN NÚMERO*';
  if (age > 100) throw '*❌ EDAD NO VÁLIDA*';
  if (age < 5) throw '*❌ EDAD NO VÁLIDA*';

  // Actualizar datos del usuario
  user.name = name;
  user.age = age;
  user.regTime = +new Date();
  user.registered = true;

  const sn = createHash('md5').update(m.sender).digest('hex');

  const caption = `
╭───「 *✅ REGISTRO EXITOSO* 」
│ ¡Bienvenido/a a KARBOT-MD!
│
│ 📝 *Nombre:* ${name}
│ 🎂 *Edad:* ${age} años
│ 
│ 🔐 *Número de serie:*
│ ┃ ${sn}
│ 
│ 💰 *Recompensa por registro:*
│ ➺ $10,000
│ ➺ 10,000 XP
│ 
│ ¡Disfruta de todas las
│ funciones del bot!
╰───────────────
*🤖 KARBOT-MD | © 2024*`;

  // Sistema de reacción
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '✅',
        key: m.key
      }
    });
  } catch (reactError) {
    // Ignorar error de reacción
  }

  // Enviar solo mensaje de texto sin archivos
  await conn.sendMessage(m.chat, { 
    text: caption
  }, { quoted: m });

  // Recompensas
  user.money = (user.money || 0) + 10000;
  user.exp = (user.exp || 0) + 10000;
};

handler.help = ['verificar'];
handler.tags = ['xp'];
handler.command = /^(verify|register|verificar|reg|registrar)$/i;

export default handler;