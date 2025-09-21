/* Creador: HERNANDEZ */

const handler = async (m, {isOwner, isAdmin, conn, text, participants, args, command, usedPrefix}) => {
  if (usedPrefix == 'a' || usedPrefix == 'A') return;
  if (!(isAdmin || isOwner)) {
    global.dfail('admin', m, conn);
    throw false;
  }
  const pesan = args.join` `;
  const oi = `*Mensaje:* ${pesan}`;
  let teks = `*📢 ¡Hey, atención a todos! 📢*\n\n${oi}\n\n*👥 Miembros del grupo:*\n`;
  for (const mem of participants) {
    teks += `┣➥ @${mem.jid.split('@')[0]}\n`;
  }
  teks += `\n*└* By KARBOT-MD\n\n*▌│█║▌║▌║║▌║▌║▌║█*`;
  conn.sendMessage(m.chat, {text: teks, mentions: participants.map((a) => a.jid)} );
};

handler.help = ['tagall <mesaje>', 'invocar <mesaje>'];
handler.tags = ['group'];
handler.command = /^(tagall|invocar|invocacion|todos|invocación)$/i;
handler.admin = true;
handler.group = true;

export default handler;
