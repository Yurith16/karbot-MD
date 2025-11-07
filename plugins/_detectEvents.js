// Karbot - Sistema de detección de eventos de grupo

import { WAMessageStubType } from "baileys";
import fetch from 'node-fetch';
import fs from 'fs';

const groupMetadataCache = new Map();

export async function before(m, { conn, participants }) {
  if (!m?.messageStubType || !m?.isGroup || m?.messageStubType == 2) return;

  const safeOperation = async (operation, fallback = null) => {
    try {
      return await operation();
    } catch (error) {
      return fallback;
    }
  };

  try {     
    if (m.messageStubType === 'GROUP_PARTICIPANT_REMOVE') {
      m.messageStubType = 28;
    } else if (m.messageStubType === 'GROUP_PARTICIPANT_LEAVE') {
      m.messageStubType = 32;
    }

    const realSender = await resolveLidFromCache(m?.sender, m?.chat);
    const chat = global?.db?.data?.chats[m.chat];

    let groupName = "el grupo";
    let groupMetadata = groupMetadataCache.get(m.chat);

    if (!groupMetadata) {
      groupMetadata = await safeOperation(() => conn.groupMetadata(m.chat));
      if (groupMetadata) {
        groupMetadataCache.set(m.chat, groupMetadata);
        groupName = groupMetadata.subject || "el grupo";
      }
    } else {
      groupName = groupMetadata.subject || "el grupo";
    }

    const groupAdmins = participants.filter((p) => p.admin);

    const resolvedStubParameters = await Promise.all(
      (m.messageStubParameters || []).map(async (param) => {
        return await resolveLidFromCache(param, m.chat);
      })
    );

    const mentionsString = [realSender, ...resolvedStubParameters, ...groupAdmins.map((v) => v.id)];
    const mentionsContentM = [realSender, ...resolvedStubParameters];
    const fkontak2 = {'key': {'participants': '0@s.whatsapp.net','remoteJid': 'status@broadcast','fromMe': false,'id': 'Halo'},'message': {'contactMessage': {'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${realSender.split('@')[0]}:${realSender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`}},'participant': '0@s.whatsapp.net'};

    if (chat?.detect2) {
      switch (m.messageStubType) {
        case 29:
          await safeOperation(async () => {
            const userDisplay = getUserDisplayName(resolvedStubParameters[0]);
            let txt = `*「🎖️」 Evento de Grupo*\n\n` +
                     `> ✦ *Usuario:* » ${userDisplay}\n` +
                     `> ✦ *Acción:* » Promovido a administrador\n` +
                     `> ✦ *Por:* » @${realSender.split('@')[0]}`;
            await conn.sendMessage(m.chat, { text: txt, mentions: mentionsString }, { quoted: fkontak2 });
          });
          break;

        case 30:
          await safeOperation(async () => {
            const userDisplay = getUserDisplayName(resolvedStubParameters[0]);
            let txt = `*「📉」 Evento de Grupo*\n\n` +
                     `> ✦ *Usuario:* » ${userDisplay}\n` +
                     `> ✦ *Acción:* » Removido como administrador\n` +
                     `> ✦ *Por:* » @${realSender.split('@')[0]}`;
            await conn.sendMessage(m.chat, { text: txt, mentions: mentionsString }, { quoted: fkontak2 });
          });
          break;

        case 27:
          await safeOperation(async () => {
            const userDisplay = getUserDisplayName(resolvedStubParameters[0]);
            let txt = `*「👤」 Evento de Grupo*\n\n`;
            if (!realSender.endsWith('@g.us')) {
              txt += `> ✦ *Usuario:* » ${userDisplay}\n` +
                     `> ✦ *Acción:* » Agregado al grupo\n` +
                     `> ✦ *Por:* » @${realSender.split('@')[0]}`;
            } else {
              txt += `> ✦ *Usuario:* » ${userDisplay}\n` +
                     `> ✦ *Acción:* » Se unió al grupo`;
            }
            await conn.sendMessage(m.chat, { text: txt, mentions: mentionsContentM }, { quoted: fkontak2 });
          });
          break;

        case 28:
          await safeOperation(async () => {
            const userDisplay = getUserDisplayName(resolvedStubParameters[0]);
            let txt = `*「🚫」 Evento de Grupo*\n\n`;
            const isSelfRemoval = resolvedStubParameters[0] === realSender;
            if (!realSender.endsWith('@g.us')) {
              if (isSelfRemoval) {
                txt += `> ✦ *Usuario:* » ${userDisplay}\n` +
                       `> ✦ *Acción:* » Salió del grupo`;
              } else {
                txt += `> ✦ *Usuario:* » ${userDisplay}\n` +
                       `> ✦ *Acción:* » Eliminado del grupo\n` +
                       `> ✦ *Por:* » @${realSender.split('@')[0]}`;
              }
            } else {
              txt += `> ✦ *Usuario:* » ${userDisplay}\n` +
                     `> ✦ *Acción:* » Salió del grupo`;
            }
            await conn.sendMessage(m.chat, { text: txt, mentions: mentionsContentM }, { quoted: fkontak2 });
          });
          break;

        case 32:
          await safeOperation(async () => {
            const userDisplay = getUserDisplayName(resolvedStubParameters[0]);
            let txt = `*「🚪」 Evento de Grupo*\n\n` +
                     `> ✦ *Usuario:* » ${userDisplay}\n` +
                     `> ✦ *Acción:* » Abandonó el grupo`;
            await conn.sendMessage(m.chat, { text: txt, mentions: [resolvedStubParameters[0]] }, { quoted: fkontak2 });
          });
          break;

        case 26:
          await safeOperation(async () => {
            const accion = resolvedStubParameters[0]?.split('@')[0] === 'on' ? 'cerrado' : 'abierto';
            let txt = `*「⚙️」 Evento de Grupo*\n\n` +
                     `> ✦ *Configuración:* » Grupo ${accion}\n` +
                     `> ✦ *Por:* » @${realSender.split('@')[0]}`;
            await conn.sendMessage(m.chat, { text: txt, mentions: mentionsContentM }, { quoted: fkontak2 });
          });
          break;

        case 21:
          await safeOperation(async () => {
            let txt = `*「🏷️」 Evento de Grupo*\n\n` +
                     `> ✦ *Nuevo nombre:* » ${groupName}\n` +
                     `> ✦ *Por:* » @${realSender.split('@')[0]}`;
            await conn.sendMessage(m.chat, { text: txt, mentions: mentionsContentM }, { quoted: fkontak2 });
          });
          break;
      }
    }
    return true;
  } catch (error) {
    return true;
  }
}

// ... (las funciones auxiliares se mantienen igual)
async function resolveLidFromCache(jid, groupChatId, conn) {
  if (!jid || !jid.toString().endsWith('@lid')) {
    return jid?.includes('@') ? jid : `${jid}@s.whatsapp.net`;
  }

  if (!conn?.lid) {
    return jid;
  }

  try {
    if (conn.lid.resolveLid) {
      const resolved = await conn.lid.resolveLid(jid, groupChatId);
      if (resolved && resolved !== jid) {
        return resolved;
      }
    }

    const lidKey = jid.split('@')[0];
    const userInfo = conn.lid.getUserInfo(lidKey);
    if (userInfo && userInfo.jid && !userInfo.jid.endsWith('@lid')) {
      return userInfo.jid;
    }

    const cachedUsers = conn.lid.getAllUsers();
    for (const user of cachedUsers) {
      if (user.lid === jid && user.jid && !user.jid.endsWith('@lid')) {
        return user.jid;
      }
    }

    return jid;

  } catch (error) {
    return jid;
  }
}

function getUserDisplayName(jid, conn) {
  if (!jid) {
    return '@undefined';
  }

  if (jid.includes('@') && !jid.includes('@lid')) {
    return `@${jid.split('@')[0]}`;
  }

  if (jid.includes('@lid')) {
    try {
      const lidKey = jid.split('@')[0];

      if (conn?.lid) {
        const userInfo = conn.lid.getUserInfo(lidKey);
        if (userInfo) {
          if (userInfo.name && 
              userInfo.name !== 'Nombre pendiente' && 
              userInfo.name !== 'Usuario no encontrado' &&
              userInfo.name !== 'Error al resolver') {
            return userInfo.name;
          }

          if (userInfo.jid && !userInfo.jid.endsWith('@lid')) {
            return `@${userInfo.jid.split('@')[0]}`;
          }
        }
      }

      return `@${lidKey}`;

    } catch (error) {
      return 'Usuario no identificado';
    }
  }

  return `@${jid}`;
}