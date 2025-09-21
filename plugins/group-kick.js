const groupMetadataCache = new Map();
const lidCache = new Map();

const handler = async (m, {conn, participants, command, usedPrefix, text}) => {
  if (!global.db.data.settings[conn.user.jid].restrict) {
    throw `❌ *LA FUNCIÓN RESTRICT DEBE ESTAR ACTIVADA*\n\nVe a la configuración del bot y activa la opción "restrict"`;
  }

  const kicktext = `👥 *DEBES ETIQUETAR A UN USUARIO*\n\nEjemplo: ${usedPrefix + command} @usuario\nO responde a un mensaje con el comando`;

  const getMentionedUserAndReason = async () => {
    let mentionedJid = null;
    let reason = null;
    const mentionedJids = await m.mentionedJid;

    if (mentionedJids && mentionedJids.length > 0) {
      mentionedJid = mentionedJids[0];
      if (text) {
        const textAfterMention = text.replace(/@\d+/g, '').trim();
        if (textAfterMention) {
          reason = textAfterMention;
        }
      }
    } else if (m.quoted && m.quoted.sender) {
      mentionedJid = m.quoted.sender;
      if (text && text.trim()) {
        reason = text.trim();
      }
    } else if (m.message?.extendedTextMessage?.contextInfo) {
      const contextInfo = m.message.extendedTextMessage.contextInfo;
      if (contextInfo.mentionedJid && contextInfo.mentionedJid.length > 0) {
        mentionedJid = contextInfo.mentionedJid[0];
        if (text) {
          const textAfterMention = text.replace(/@\d+/g, '').trim();
          if (textAfterMention) {
            reason = textAfterMention;
          }
        }
      } else if (contextInfo.participant) {
        mentionedJid = contextInfo.participant;
        if (text && text.trim()) {
          reason = text.trim();
        }
      }
    }

    if (!mentionedJid) return { user: null, reason: null };
    const resolvedJid = await resolveLidToRealJid(mentionedJid, conn, m.chat);
    return { user: resolvedJid, reason: reason };
  };

  const { user: mentionedUser, reason: kickReason } = await getMentionedUserAndReason();
  if (!mentionedUser) return m.reply(kicktext, m.chat, {mentions: conn.parseMention(kicktext)});
  if (conn.user.jid.includes(mentionedUser)) return m.reply('❌ *NO PUEDO EXPULSARME A MÍ MISMO*');

  if (kickReason) {
    const userTag = mentionedUser.split('@')[0];
    const reasonMessage = `╭─⬣「 🚫 *ADVERTENCIA* 🚫 」⬣\n│\n├❯ *Usuario:* @${userTag}\n├❯ *Acción:* Expulsión del grupo\n├❯ *Motivo:* ${kickReason}\n├❯ *Admin:* @${m.sender.split('@')[0]}\n│\n╰─⬣ *¡Hasta luego!* ⬣`;

    await conn.sendMessage(m.chat, {
      text: reasonMessage,
      mentions: [mentionedUser, m.sender]
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  try {
    const response = await conn.groupParticipantsUpdate(m.chat, [mentionedUser], 'remove');
    const userTag = mentionedUser.split('@')[0];

    if (response[0]?.status === '200') {
      m.reply(`✅ *USUARIO EXPULSADO*\n\n@${userTag} ha sido eliminado del grupo`, m.chat, {mentions: conn.parseMention(`@${userTag}`)});
    } else if (response[0]?.status === '406') {
      m.reply(`❌ *NO SE PUEDE EXPULSAR*\n\n@${userTag} es administrador del grupo`, m.chat, {mentions: conn.parseMention(`@${userTag}`)});
    } else if (response[0]?.status === '404') {
      m.reply(`❌ *USUARIO NO ENCONTRADO*\n\n@${userTag} no está en el grupo`, m.chat, {mentions: conn.parseMention(`@${userTag}`)});
    } else {
      conn.sendMessage(m.chat, {
        text: `❌ *ERROR AL EXPULSAR*\n\nNo se pudo completar la acción`,
        mentions: [m.sender]
      }, {quoted: m});
    }
  } catch (error) {
    console.error('Error en kick:', error);
    conn.sendMessage(m.chat, {
      text: `❌ *ERROR AL EXPULSAR*\n\nNo se pudo completar la acción: ${error.message}`,
      mentions: [m.sender]
    }, {quoted: m});
  }
};

handler.help = ['kick @usuario [motivo]'];
handler.tags = ['group'];
handler.command = /^(kick|expulsar|eliminar|echar|sacar|remove)$/i;
handler.admin = handler.group = handler.botAdmin = true;

export default handler;

async function resolveLidToRealJid(lid, conn, groupChatId, maxRetries = 3, retryDelay = 1000) {
    const inputJid = lid?.toString();

    if (!inputJid || !inputJid.endsWith("@lid") || !groupChatId?.endsWith("@g.us")) {
        return inputJid?.includes("@") ? inputJid : `${inputJid}@s.whatsapp.net`;
    }

    if (lidCache.has(inputJid)) return lidCache.get(inputJid);

    const lidToFind = inputJid.split("@")[0];
    let attempts = 0;

    while (attempts < maxRetries) {
        try {
            let metadata;
            if (groupMetadataCache.has(groupChatId)) {
                metadata = groupMetadataCache.get(groupChatId);
            } else {
                metadata = await conn?.groupMetadata(groupChatId);
                if (metadata) {
                    groupMetadataCache.set(groupChatId, metadata);
                    setTimeout(() => groupMetadataCache.delete(groupChatId), 300000);
                }
            }

            if (!metadata?.participants) throw new Error("No se obtuvieron participantes");

            for (const participant of metadata.participants) {
                try {
                    if (!participant?.jid) continue;
                    const contactDetails = await conn?.onWhatsApp(participant.jid);
                    if (!contactDetails?.[0]?.lid) continue;
                    const possibleLid = contactDetails[0].lid.split("@")[0];
                    if (possibleLid === lidToFind) {
                        lidCache.set(inputJid, participant.jid);
                        return participant.jid;
                    }
                } catch (e) { continue }
            }

            lidCache.set(inputJid, inputJid);
            return inputJid;

        } catch (error) {
            if (++attempts >= maxRetries) {
                lidCache.set(inputJid, inputJid);
                return inputJid;
            }
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
    }

    return inputJid;
}