/* Desarrollado y Creado por: HERNANDEZ - KARBOT-MD */

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.downloader_imagen;

  if (!text) {
    return m.reply(`🖼️ *INGRESE LO QUE DESEA BUSCAR*\n*Ejemplo:* ${usedPrefix + command} Minecraft`);
  }

  try {
    const api = await axios.get(`${global.BASE_API_DELIRIUS}/search/gimage?query=${text}`);
    const data = api.data.data;
    const filteredData = data.filter(image => {
      const url = image.url.toLowerCase();
      return url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png');
    });

    if (filteredData.length === 0) {
      return m.reply(`❌ *NO SE ENCONTRARON IMÁGENES DE: ${text}*`);
    }

    const random = Math.floor(Math.random() * filteredData.length);
    const image = filteredData[random];

    conn.sendFile(m.chat, image.url, 'karbot-image.jpg', 
      `✅ *IMAGEN ENCONTRADA:* ${text}\n🔗 *Fuente:* ${image.origin.website.url}\n📸 *Resolución:* ${image.origin.width}x${image.origin.height}`, 
    m);
  } catch (error) {
    m.reply(`❌ *ERROR AL BUSCAR IMÁGENES*`);
    console.error('Error en búsqueda de imágenes:', error);
  }
};

handler.help = ['image'];
handler.tags = ['internet', 'tools'];
handler.command = ['imagen', 'gimage', 'image'];

export default handler;