const handler = async (m, {conn}) => {
  const user = global.db.data.users[m.sender];

  // Verificar tiempo de espera
  const time = global.db.data.users[m.sender].lastberburu + 2700000; // 45 Minutos
  if (new Date - global.db.data.users[m.sender].lastberburu < 2700000) {
    const remainingTime = clockString(time - new Date());

    // Reacción de espera
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '⏳',
          key: m.key
        }
      });
    } catch (reactError) {}

    return conn.reply(m.chat, `⏳ *ENFRIAMIENTO DE CAZA*\n\nPuedes cazar nuevamente en:\n${remainingTime}`, m);
  }

  // Generar cantidades aleatorias de animales
  const animales = {
    banteng: Math.floor(Math.random() * 5),
    harimau: Math.floor(Math.random() * 5),
    gajah: Math.floor(Math.random() * 5),
    kambing: Math.floor(Math.random() * 5),
    panda: Math.floor(Math.random() * 5),
    buaya: Math.floor(Math.random() * 5),
    kerbau: Math.floor(Math.random() * 5),
    sapi: Math.floor(Math.random() * 5),
    monyet: Math.floor(Math.random() * 5),
    babihutan: Math.floor(Math.random() * 5),
    babi: Math.floor(Math.random() * 5),
    ayam: Math.floor(Math.random() * 5)
  };

  // Armas aleatorias
  const armas = ['🪚', '⛏️', '🧨', '💣', '🔫', '🔪', '🗡️', '🏹', '🦾', '🥊', '🧹', '🔨', '🛻'];

  // Reacción de inicio de caza
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '🎯',
        key: m.key
      }
    });
  } catch (reactError) {}

  // Mensajes de progreso
  const mensajesProgreso = [
    "🎯 *Objetivo fijado...*",
    "🍖 *Colocando carnada...*",
    "🔫 *Preparando armas...*",
    "🚗 *Buscando ubicación...*",
    "🌲 *Explorando el bosque...*",
    "🐾 *Siguiendo huellas...*"
  ];

  const mensajesExito = [
    "🎉 *¡Animales detectados!*",
    "💥 *¡Cacería exitosa!*", 
    "🏹 *¡Todos los blancos acertados!*",
    "🚀 *¡Excelente puntería!*"
  ];

  // Progreso de la caza
  setTimeout(async () => {
    await conn.reply(m.chat, `${conn.getName(m.sender)} ${mensajesProgreso[Math.floor(Math.random() * mensajesProgreso.length)]}`, m);
  }, 5000);

  setTimeout(async () => {
    await conn.reply(m.chat, `${conn.getName(m.sender)} ${mensajesProgreso[Math.floor(Math.random() * mensajesProgreso.length)]}`, m);
  }, 10000);

  setTimeout(async () => {
    await conn.reply(m.chat, `${conn.getName(m.sender)} ${mensajesExito[Math.floor(Math.random() * mensajesExito.length)]}`, m);
  }, 15000);

  // Resultado final
  setTimeout(async () => {
    // Reacción de éxito
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '🎁',
          key: m.key
        }
      });
    } catch (reactError) {}

    const hsl = `
┌──「 🎯 CAZA EXITOSA 」
│ 
│ 👤 *Cazador:* ${conn.getName(m.sender)}
│ 
│ 🐾 *Animales capturados:*
│ 🐂 Banteng: ${animales.banteng} ${armas[Math.floor(Math.random() * armas.length)]}
│ 🐅 Harimau: ${animales.harimau} ${armas[Math.floor(Math.random() * armas.length)]}
│ 🐘 Gajah: ${animales.gajah} ${armas[Math.floor(Math.random() * armas.length)]}
│ 🐐 Kambing: ${animales.kambing} ${armas[Math.floor(Math.random() * armas.length)]}
│ 🐼 Panda: ${animales.panda} ${armas[Math.floor(Math.random() * armas.length)]}
│ 🐊 Buaya: ${animales.buaya} ${armas[Math.floor(Math.random() * armas.length)]}
│ 🐃 Kerbau: ${animales.kerbau} ${armas[Math.floor(Math.random() * armas.length)]}
│ 🐮 Sapi: ${animales.sapi} ${armas[Math.floor(Math.random() * armas.length)]}
│ 🐒 Monyet: ${animales.monyet} ${armas[Math.floor(Math.random() * armas.length)]}
│ 🐗 Babi Hutan: ${animales.babihutan} ${armas[Math.floor(Math.random() * armas.length)]}
│ 🐖 Babi: ${animales.babi} ${armas[Math.floor(Math.random() * armas.length)]}
│ 🐓 Ayam: ${animales.ayam} ${armas[Math.floor(Math.random() * armas.length)]}
│ 
│ 🏆 *¡Buena cacería!*
└──────────────`.trim();

    // Actualizar inventario del usuario
    Object.keys(animales).forEach(animal => {
      global.db.data.users[m.sender][animal] += animales[animal];
    });

    await conn.reply(m.chat, hsl, m);
    user.lastberburu = new Date() * 1;
  }, 20000);
};

handler.help = ['berburu'];
handler.tags = ['xp'];
handler.command = /^(hunt|berburu|caza(r)?|cacería)$/i;
handler.group = true;

export default handler;

function clockString(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, 0)).join(':');
}

