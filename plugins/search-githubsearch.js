import fetch from 'node-fetch';

const handler = async (m, {conn, text, usedPrefix, command}) => {
  // Sistema de reacción - indicar procesamiento
  await conn.sendMessage(m.chat, { react: { text: '🐙', key: m.key } });

  if (!text) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    throw `*[❗] 𝙄𝙣𝙜𝙧𝙚𝙨𝙖 𝙪𝙣 𝙩𝙚𝙭𝙩𝙤 𝙥𝙖𝙧𝙖 𝙗𝙪𝙨𝙘𝙖𝙧, 𝙚𝙟𝙚𝙢𝙥𝙡𝙤: ${usedPrefix + command} 𝙆𝙖𝙧𝙗𝙤𝙩-𝙈𝘿*`;
  }

  // Reacción de búsqueda
  await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

  try {
    const res = await fetch(global.API('https://api.github.com', '/search/repositories', {
      q: text,
    }));
    const json = await res.json();
    if (res.status !== 200) throw json;

    // Reacción de éxito
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    const str = json.items.map((repo, index) => {
    return `
┌───「🐙 ${1 + index}. ${repo.full_name}${repo.fork ? ' (𝙛𝙤𝙧𝙠)' : ''}」─
▸ 🔗 𝙐𝙍𝙇: ${repo.html_url}
▸ 📅 𝘾𝙧𝙚𝙖𝙙𝙤: ${formatDate(repo.created_at)}
▸ 🔄 𝘼𝙘𝙩𝙪𝙖𝙡𝙞𝙯𝙖𝙙𝙤: ${formatDate(repo.updated_at)}
▸ 📥 𝘾𝙡𝙤𝙣𝙚: ${repo.clone_url}
▸ 📊 𝙀𝙨𝙩𝙖𝙙í𝙨𝙩𝙞𝙘𝙖𝙨:
   👁 ${repo.watchers} ◉ 🍴 ${repo.forks} ◉ ⭐ ${repo.stargazers_count}
${repo.description ? `▸ 📝 𝘿𝙚𝙨𝙘𝙧𝙞𝙥𝙘𝙞ó𝙣:\n   ${repo.description}` : ''}
└───────────────────────`.trim()}).join('\n\n◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦\n\n');

    conn.sendMessage(m.chat, {text: `*🐙 𝙍𝙀𝙎𝙐𝙇𝙏𝘼𝘿𝙊𝙎 𝘿𝙀 𝙂𝙄𝙏𝙃𝙐𝘽*\n\n*🔍 𝘽ú𝙨𝙦𝙪𝙚𝙙𝙖:* ${text}\n*📦 𝙍𝙚𝙥𝙤𝙨𝙞𝙩𝙤𝙧𝙞𝙤𝙨:* ${json.items.length}\n\n${str.trim()}`}, {quoted: m});

  } catch (error) {
    // Reacción de error
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    console.error('Error en GitHub search:', error);
    conn.sendMessage(m.chat, {text: '*[❗] 𝙀𝙧𝙧𝙤𝙧 𝙖𝙡 𝙗𝙪𝙨𝙘𝙖𝙧 𝙚𝙣 𝙂𝙞𝙩𝙃𝙪𝙗*'}, {quoted: m});
  }
};

handler.help = ['githubsearch'];
handler.tags = ['search'];
handler.command = /^(ghs|githubs|githubs|githubsearch|gits|gitsearch)$/i;
export default handler;

function formatDate(n, locale = 'es') {
  const d = new Date(n);
  return d.toLocaleDateString(locale, {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'});
}