const cooldown = 1500000; // 25 minutos

const handler = async (m, {usedPrefix, conn}) => {
  try {
    const user = global.db.data.users[m.sender];
    const timers = cooldown - (new Date() - user.lastadventure);

    // Verificar salud
    if (user.health < 80) {
      // Reacción de salud baja
      try {
        await conn.sendMessage(m.chat, {
          react: {
            text: '❤️',
            key: m.key
          }
        });
      } catch (reactError) {}

      return conn.reply(m.chat, 
        `┌──「 ❌ SALUD INSUFICIENTE 」
│
│ Tu salud está muy baja para aventurarte.
│ 
│ ❤️ *Salud actual:* ${user.health} HP
│ 💊 *Mínimo requerido:* 80 HP
│ 
│ Usa *${usedPrefix}heal* para curarte
└──────────────`, m);
    }

    // Verificar cooldown
    if (new Date() - user.lastadventure <= cooldown) {
      const remainingTime = msToTime(timers);

      // Reacción de cooldown
      try {
        await conn.sendMessage(m.chat, {
          react: {
            text: '⏳',
            key: m.key
          }
        });
      } catch (reactError) {}

      return conn.reply(m.chat, 
        `┌──「 ⏳ AVENTURA EN ENFRIAMIENTO 」
│
│ Debes esperar antes de tu próxima aventura.
│ 
│ ⏰ *Tiempo restante:*
│ ${remainingTime}
│ 
│ 🏕️ ¡La paciencia es clave!
└──────────────`, m);
    }

    // Reacción de inicio de aventura
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '🏕️',
          key: m.key
        }
      });
    } catch (reactError) {}

    const rewards = reward(user);
    let text = `┌──「 🏕️ AVENTURA COMPLETADA 」
│
│ 🎯 *¡Aventura exitosa!*
│ 
│ 📍 *Ubicación explorada:*
│ ➺ Bosque Encantado 🌲
│ ➺ Montaña del Dragón 🏔️
│ ➺ Cueva de Cristal 💎
│ 
│ 📦 *Recursos obtenidos:*\n`;

    // Pérdidas
    let perdidas = '';
    for (const lost in rewards.lost) {
      if (user[lost]) {
        const total = rewards.lost[lost].getRandom();
        user[lost] -= total * 1;
        if (total) perdidas += `│ ➺ -${total} ${rpgEmoticon(lost)}\n`;
      }
    }

    if (perdidas) {
      text += `│\n│ 💔 *Pérdidas:*\n${perdidas}`;
    }

    // Recompensas
    let recompensas = '';
    for (const rewardItem in rewards.reward) {
      if (rewardItem in user) {
        const total = rewards.reward[rewardItem].getRandom();
        user[rewardItem] += total * 1;
        if (total) recompensas += `│ ➺ +${total} ${rpgEmoticon(rewardItem)}\n`;
      }
    }

    text += `│\n│ 🎁 *Recompensas:*\n${recompensas}│\n│ 🎊 ¡Tesoros encontrados!\n└──────────────`;

    conn.reply(m.chat, text, m);
    user.lastadventure = new Date() * 1;

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

    conn.reply(m.chat, 
      `┌──「 ❌ ERROR EN AVENTURA 」
│
│ Ocurrió un problema durante la aventura.
│ 
│ 🔧 Intenta nuevamente más tarde
└──────────────`, m);
  }
};

handler.help = ['adventure'];
handler.tags = ['xp'];
handler.command = /^(adventure|adv|aventura|aventurar|explorar)$/i;
handler.cooldown = cooldown;
handler.disabled = false;

export default handler;

function reward(user = {}) {
  const rewards = {
    reward: {
      money: [300, 400, 500, 600],
      exp: [200, 300, 400, 500],
      trash: [100, 150, 200],
      potion: [1, 2, 3],
      rock: [1, 2],
      wood: [2, 3],
      string: [1, 2],
      common: [1, 2],
      iron: [0, 1],
      gold: [0, 1],
      diamond: [0, 1]
    },
    lost: {
      health: [10, 15, 20],
      armordurability: [5, 10]
    },
  };
  return rewards;
}

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);

  minutes = (minutes < 10) ? '0' + minutes : minutes;
  seconds = (seconds < 10) ? '0' + seconds : seconds;

  return `${minutes}:${seconds}`;
}

function rpgEmoticon(item) {
  const emoticons = {
    money: '💰',
    exp: '⭐',
    trash: '🗑️',
    potion: '🥤',
    rock: '🪨',
    wood: '🪵',
    string: '🕸️',
    common: '📦',
    iron: '⚙️',
    gold: '🪙',
    diamond: '💎',
    health: '❤️',
    armordurability: '🛡️'
  };
  return emoticons[item] || '🎁';
}