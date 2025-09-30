import axios from 'axios';
import fs from 'fs';

const handler = async (m, { conn, text }) => {
  // Sistema de reacción - reaccionar al mensaje con ⏳
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

  if (!text) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    return conn.reply(m.chat, '*🚫 Por favor ingresa un usuario de TikTok*', m);
  }  

  try {
    const response = await axios.get("https://delirius-apiofc.vercel.app/tools/tiktokstalk", {
      params: { q: text }
    });

    const data = response.data;
    if (data.status && data.result) {
      const user = data.result.users;
      const stats = data.result.stats;

      const body = `*📱 INFORMACIÓN DE TIKTOK*\n\n` +
                   `*👤 Usuario:* ${user.username || '-'}\n` +
                   `*📛 Nombre:* ${user.nickname || '-'}\n` +
                   `*👥 Seguidores:* ${stats.followerCount || '-'}\n` +
                   `*📈 Siguiendo:* ${stats.followingCount || '-'}\n` +
                   `*❤️ Likes:* ${stats.likeCount || '-'}\n` +
                   `*🎥 Videos:* ${stats.videoCount || '-'}\n` +
                   `*📝 Biografía:* ${user.signature || '-'}`.trim();

      const imageUrl = user.avatarLarger;
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(imageResponse.data, "binary");

      // Reaccionar con ✅ antes de enviar el resultado
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      await conn.sendFile(m.chat, imageBuffer, 'profile.jpg', body, m);

    } else {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      throw '*❌ Usuario no encontrado*'; 
    }
  } catch (e) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    throw '*❌ Error al buscar el usuario de TikTok*';  
  }
};

handler.help = ['tiktokstalk'];
handler.tags = ['tools'];
handler.command = ['ttstalk', 'tiktokstalk'];

export default handler;