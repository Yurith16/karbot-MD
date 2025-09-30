/* Desarrollado y Creado por: HERNANDEZ - KARBOT-MD */

import {search, download} from 'aptoide-scraper';

const handler = async (m, {conn, usedPrefix: prefix, command, text}) => {
  // Sistema de reacción - Indicar que el comando fue detectado
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
  
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.downloader_modapk

  if (!text) throw `📱 *INGRESE EL NOMBRE DE LA APLICACIÓN*`;

  try {    
    // Cambiar reacción a "buscando"
    await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });
    
    const searchA = await search(text);
    if (!searchA || searchA.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      throw `❌ *NO SE ENCONTRÓ LA APLICACIÓN: ${text}*`;
    }

    // Cambiar reacción a "descargando"
    await conn.sendMessage(m.chat, { react: { text: '📥', key: m.key } });
    
    const data5 = await download(searchA[0].id);
    
    let response = `📦 *INFORMACIÓN DE LA APK*\n
🔹 *Nombre:* ${data5.name}
🔹 *Paquete:* ${data5.package}
🔹 *Actualización:* ${data5.lastup}
🔹 *Tamaño:* ${data5.size}
🔹 *Versión:* ${data5.version}`;

    await conn.sendMessage(m.chat, {image: {url: data5.icon}, caption: response}, {quoted: m});
    
    if (data5.size.includes('GB') || data5.size.replace(' MB', '') > 999) {
      await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
      return await conn.sendMessage(m.chat, {text: `📦 *ARCHIVO DEMASIADO GRANDE*\nEl APK pesa ${data5.size} y no puede ser enviado por WhatsApp.`}, {quoted: m});
    }

    // Cambiar reacción a "enviando"
    await conn.sendMessage(m.chat, { react: { text: '📤', key: m.key } });
    
    await conn.sendMessage(m.chat, {
      document: {
        url: data5.dllink
      }, 
      mimetype: 'application/vnd.android.package-archive', 
      fileName: `KARBOT-${data5.name}.apk`, 
      caption: `📦 *APK DESCARGADA EXITOSAMENTE*\n🔹 ${data5.name}`
    }, {quoted: m});
    
    // Reacción de éxito final
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    
  } catch (error) {
    // Reacción de error
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    console.error('Error en descarga de APK:', error);
    throw `❌ *ERROR AL DESCARGAR LA APK*\n${error.message || 'Intente nuevamente'}`;
  }
};

handler.help = ['apk']
handler.tags = ['search']
handler.command = /^(apk|apkmod|modapk|dapk2|aptoide|aptoidedl)$/i

export default handler;