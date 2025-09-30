const handler = async (m, { conn }) => {
  const who = m.quoted ? await m?.quoted?.sender : await m.mentionedJid && await await m.mentionedJid[0] ? await await m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
  
  conn.sendFile(m.chat, global.API('https://some-random-api.com', '/canvas/blur', {
    avatar: await conn.profilePictureUrl(who, 'image').catch((_) => 'https://telegra.ph/file/24fa902ead26340f3df2c.png'),
  }), 'blur.png', '✅ *Efecto difuminado aplicado*', m);
};

handler.help = ['blur', 'difuminar'];
handler.tags = ['maker'];
handler.command = /^(blur|difuminar|difuminar2)$/i;
export default handler;