import * as baileys from "baileys";

const handler = async (m, {conn, text}) => {
  // Sistema de reacción - indicar procesamiento
  await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

  const [, code] = text.match(/chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i) || [];

  if (!code) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    throw `*🚫 ENLACE INVÁLIDO*\n\n_Proporciona un enlace de grupo de WhatsApp válido_\n\n*Ejemplo:*\n${usedPrefix}inspect https://chat.whatsapp.com/ABC123...`;
  }

  try {
    // Reacción de procesamiento
    await conn.sendMessage(m.chat, { react: { text: '📊', key: m.key } });

    const res = await conn.query({
      tag: 'iq', 
      attrs: {type: 'get', xmlns: 'w:g2', to: '@g.us'}, 
      content: [{tag: 'invite', attrs: {code}}]
    });

    const data = extractGroupMetadata(res);

    const groupInfo = `*🔍 INFORMACIÓN DEL GRUPO*\n
*🆔 ID:* ${data.id}
*📛 Nombre:* ${data.subject}
*📅 Creado:* ${data.creation}
*👤 Creador:* ${data.owner}
*📝 Descripción:*
${data.desc || '*Sin descripción*'}`;

    // Reacción de éxito
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    // Intentar obtener la foto del grupo
    try {
      const pp = await conn.profilePictureUrl(data.id, 'image').catch(() => null);
      if (pp) {
        return conn.sendMessage(m.chat, {
          image: {url: pp}, 
          caption: groupInfo
        }, {quoted: m});
      } else {
        // Si no hay foto, enviar solo el texto con mejor formato
        const groupInfoWithBorder = `*╔═══════════════════════════*\n${groupInfo}\n*╚═══════════════════════════*`;
        await conn.reply(m.chat, groupInfoWithBorder, m);
      }
    } catch (ppError) {
      // Si hay error con la foto, enviar solo texto
      const groupInfoWithBorder = `*╔═══════════════════════════*\n${groupInfo}\n*╚═══════════════════════════*`;
      await conn.reply(m.chat, groupInfoWithBorder, m);
    }

  } catch (error) {
    // Reacción de error
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    console.error('Error en inspect:', error);

    if (error.message?.includes('404') || error.message?.includes('not found')) {
      throw `*❌ GRUPO NO ENCONTRADO*\n\n_El enlace puede estar expirado o el grupo no existe_`;
    } else if (error.message?.includes('401') || error.message?.includes('forbidden')) {
      throw `*🚫 ACCESO DENEGADO*\n\n_No tienes permiso para ver este grupo_`;
    } else {
      throw `*❌ ERROR AL INSPECCIONAR*\n\n_No se pudo obtener la información del grupo_`;
    }
  }
};

handler.help = ['inspect <link>'];
handler.tags = ['tools'];
handler.command = /^(inspect|inspeccionar|grupoinfo|infogrupo)$/i;
export default handler;

const extractGroupMetadata = (result) => {
  const group = baileys.getBinaryNodeChild(result, 'group');
  const descChild = baileys.getBinaryNodeChild(group, 'description');
  let desc;
  if (descChild) desc = baileys.getBinaryNodeChild(descChild, 'body')?.content;

  const metadata = {
    id: group.attrs.id.includes('@') ? group.attrs.id : baileys.jidEncode(group.attrs.id, 'g.us'),
    subject: group.attrs.subject || '*Sin nombre*',
    creation: new Date(+group.attrs.creation * 1000).toLocaleString('es-MX', {timeZone: 'America/Mexico_City'}),
    owner: group.attrs.creator ? 'wa.me/' + baileys.jidNormalizedUser(group.attrs.creator).split('@')[0] : group.attrs.id.includes('-') ? 'wa.me/' + group.attrs.id.split('-')[0] : '*No disponible*',
    desc: desc || '*Sin descripción*',
  };
  return metadata;
};