/* Desarrollado y Creado por: HERNANDEZ - KARBOT-MD */

const handler = async (m, {conn, usedPrefix, command}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.convertidor_togifaud

  if (!m.quoted) throw `🧿 *RESPONDA A UN VIDEO PARA CONVERTIR A GIF CON AUDIO*`;
  const q = m.quoted || m;
  const mime = (q.msg || q).mimetype || '';
  if (!/(mp4)/.test(mime)) throw `❌ *EL TIPO DE ARCHIVO ${mime} NO ES COMPATIBLE*`;
  m.reply(global.wait);
  const media = await q.download();
  conn.sendMessage(m.chat, {video: media, gifPlayback: true, caption: `✅ *GIF CON AUDIO CREADO EXITOSAMENTE*`}, {quoted: m});
};

handler.help = ['togifaud'];
handler.tags = ['converter'];
handler.command = ['gif'];

export default handler;