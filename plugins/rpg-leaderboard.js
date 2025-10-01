const handler = async (m, { conn, args, participants }) => {
  const users = Object.entries(global.db.data.users)
    .map(([key, value]) => ({
      ...value,
      jid: key,
      exp: Number(value.exp) || 0,
      limit: Number(value.limit) || 0,
      level: Number(value.level) || 0,
      money: Number(value.money) || 0
    }))
    .filter(user =>
      user.jid &&
      user.jid.endsWith("@s.whatsapp.net")
    );

  const sortedExp = [...users].sort((a, b) => b.exp - a.exp);
  const sortedLim = [...users].sort((a, b) => b.limit - a.limit);
  const sortedLevel = [...users].sort((a, b) => b.level - a.level);
  const sortedMoney = [...users].sort((a, b) => b.money - a.money);

  const len = Math.min(args[0] && !isNaN(args[0]) ? Math.max(parseInt(args[0]), 10) : 10, 100);

  const adventurePhrases = [
    "🏆 Los más poderosos del reino",
    "⚡ Los guerreros más fuertes", 
    "🌟 Leyendas en ascenso",
    "💎 Los más ricos en recursos",
    "🚀 Los que alcanzan las estrellas",
    "🔥 Los más temidos en batalla",
    "🎯 Los más precisos y hábiles",
    "💪 Los que nunca se rinden",
    "⭐ Las estrellas del servidor",
    "👑 La realeza del bot"
  ];

  const randomPhrase = adventurePhrases[Math.floor(Math.random() * adventurePhrases.length)];

  const getText = (list, prop, unit, emoji) =>
    list.slice(0, len)
      .map(({ jid, [prop]: val }, i) => {
        const phoneNumber = jid?.split('@')[0] || 'Desconocido';
        const medals = ['🥇', '🥈', '🥉'];
        const medal = i < 3 ? medals[i] : `▫️`;
        return `${medal} *${i + 1}.* @${phoneNumber}\n   ${emoji} *${val.toLocaleString()} ${unit}*`;
      })
      .join('\n\n');

  // Reacción para leaderboard
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '🏆',
        key: m.key
      }
    });
  } catch (reactError) {}

  const userExpRank = sortedExp.findIndex(u => u.jid === m.sender) + 1;
  const userLimRank = sortedLim.findIndex(u => u.jid === m.sender) + 1;
  const userLevelRank = sortedLevel.findIndex(u => u.jid === m.sender) + 1;
  const userMoneyRank = sortedMoney.findIndex(u => u.jid === m.sender) + 1;

  const body = `
┌──「 🏆 TABLA DE LÍDERES 」
│ 
│ ${randomPhrase}
│ 
├─「 📊 TU POSICIÓN 」
│ ⭐ Exp: #${userExpRank} de ${users.length}
│ 💎 Diamantes: #${userLimRank} de ${users.length}  
│ 🎯 Nivel: #${userLevelRank} de ${users.length}
│ 💰 Dinero: #${userMoneyRank} de ${users.length}
│ 
├─「 ⭐ TOP ${len} - EXPERIENCIA 」
${getText(sortedExp, 'exp', 'XP', '⭐')}
│ 
├─「 💎 TOP ${len} - DIAMANTES 」
${getText(sortedLim, 'limit', 'Diamantes', '💎')}
│ 
├─「 🎯 TOP ${len} - NIVELES 」
${getText(sortedLevel, 'level', 'Nivel', '🎯')}
│ 
├─「 💰 TOP ${len} - DINERO 」
${getText(sortedMoney, 'money', 'USD', '💰')}
│ 
└─「 🚀 ¡Sigue subiendo posiciones! 」
`.trim();

  await conn.sendMessage(m.chat, { 
    text: body, 
    mentions: conn.parseMention(body) 
  }, { quoted: m });
};

handler.help = ['leaderboard', 'top', 'clasificacion', 'ranking'];
handler.tags = ['xp'];
handler.command = ['leaderboard', 'lb', 'top', 'clasificacion', 'ranking', 'mejores', 'clasificación', 'lideres'];

export default handler;