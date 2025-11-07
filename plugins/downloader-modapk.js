import axios from 'axios';
const { search, download } = await import('aptoide-scraper');

const userRequests = {};

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const jid = m.chat;
  const sender = m.sender;

  try {
    if (!text) {
      return await conn.sendMessage(jid, {
        text: `*「📱」 Descargar APK*\n\n> ✦ *Ingresa el nombre de la aplicación:*\n> ✦ *Ejemplo:* » ${usedPrefix + command} WhatsApp`
      }, { quoted: m });
    }

    // Verificar si ya hay una solicitud en proceso
    if (userRequests[sender]) {
      return await conn.sendMessage(jid, {
        text: `*「⏳」 Descarga en Proceso*\n\n> ✦ *Ya hay una descarga en curso*\n> ✦ *Espera a que termine*`
      }, { quoted: m });
    }

    userRequests[sender] = true;

    // Reacción de búsqueda
    await conn.sendMessage(jid, {
      react: { text: '🔍', key: m.key }
    });

    const downloadAttempts = [
      async () => {
        const res = await axios.get(`https://api.dorratz.com/v2/apk-dl?text=${encodeURIComponent(text)}`);
        const data = res.data;
        if (!data.name) throw new Error('No data from dorratz API');
        return { 
          name: data.name, 
          package: data.package, 
          lastUpdate: data.lastUpdate, 
          size: data.size, 
          icon: data.icon, 
          dllink: data.dllink 
        };
      },
      async () => {
        const res = await axios.get(`https://api.delirius.xyz/download/apk?query=${encodeURIComponent(text)}`);
        const data = res.data;
        const apkData = data.data;
        return { 
          name: apkData.name, 
          developer: apkData.developer, 
          publish: apkData.publish, 
          size: apkData.size, 
          icon: apkData.image, 
          dllink: apkData.download 
        };
      },
      async () => {
        const searchA = await search(text);
        const data5 = await download(searchA[0].id);
        return { 
          name: data5.name, 
          package: data5.package, 
          lastUpdate: data5.lastup, 
          size: data5.size, 
          icon: data5.icon, 
          dllink: data5.dllink 
        };
      }
    ];

    let apkData = null;
    for (const attempt of downloadAttempts) {
      try {
        apkData = await attempt();
        if (apkData) break; 
      } catch (err) {
        console.error(`Error en API: ${err.message}`);
        continue;
      }
    }

    if (!apkData) {
      throw new Error('No se pudo descargar el APK desde ninguna API');
    }

    // Mostrar información del APK
    const apkDetails = `*「📱」 ${apkData.name}*\n\n` +
                     `> ✦ *Paquete:* » ${apkData.package || 'N/A'}\n` +
                     `> ✦ *Actualizado:* » ${apkData.lastUpdate || apkData.publish || 'Desconocido'}\n` +
                     `> ✦ *Tamaño:* » ${apkData.size}\n` +
                     `> ✦ *Desarrollador:* » ${apkData.developer || 'N/A'}`;

    await conn.sendMessage(
      jid,
      {
        image: { url: apkData.icon },
        caption: apkDetails.trim(),
      },
      { quoted: m }
    );

    await conn.sendMessage(jid, {
      react: { text: '📥', key: m.key }
    });

    // Verificar tamaño del APK
    const apkSize = apkData.size.toLowerCase();
    if (apkSize.includes('gb') || (apkSize.includes('mb') && parseFloat(apkSize) > 500)) {
      await conn.sendMessage(
        jid,
        {
          text: `*「❌」 APK Muy Pesado*\n\n> ✦ *El APK es muy grande para descargar*\n> ✦ *Tamaño:* » ${apkData.size}`
        },
        { quoted: m }
      );
      return;
    }

    // Enviar el APK
    await conn.sendMessage(
      jid,
      {
        document: { url: apkData.dllink },
        mimetype: "application/vnd.android.package-archive",
        fileName: `${apkData.name}.apk`,
        caption: `*「📦」 ${apkData.name}*\n\n> ✦ *APK descargado exitosamente*\n> ✦ *Tamaño:* » ${apkData.size}`
      },
      { quoted: m }
    );

    await conn.sendMessage(jid, {
      react: { text: '✅', key: m.key }
    });

  } catch (error) {
    console.error('Error en comando apk:', error);

    await conn.sendMessage(jid, {
      react: { text: '❌', key: m.key }
    });

    await conn.sendMessage(
      jid,
      {
        text: `*「❌」 Error en Descarga*\n\n> ✦ *Error:* » ${error.message}\n> ✦ *Solución:* » Intenta con otra aplicación`
      },
      { quoted: m }
    );
  } finally {
    // Limpiar el control de solicitudes
    delete userRequests[sender];
  }
};

handler.help = ['apk', 'apkmod', 'modapk', 'dapk2', 'aptoide', 'aptoidedl'];
handler.tags = ['download'];
handler.command = ['apk', 'apkmod', 'modapk', 'dapk2', 'aptoide', 'aptoidedl'];

export default handler;