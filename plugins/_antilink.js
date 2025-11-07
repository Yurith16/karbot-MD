const generalLinkRegex = /https?:\/\/([^\s]+)/gi;
const enhancedLinkRegex = /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/gi;

export async function before(m, {conn, isAdmin, isBotAdmin}) {
  if (m?.isBaileys && m.fromMe) return;
  if (!m?.isGroup) return;

  const chat = global.db.data.chats[m.chat];
  if (!chat?.antiLink) return;
  if (!m.text) return;

  const hasLinks1 = generalLinkRegex.test(m.text);
  const hasLinks2 = enhancedLinkRegex.test(m.text);
  if (!hasLinks1 && !hasLinks2) return;

  const user = `@${m.sender.split`@`[0]}`;

  // Si es admin, solo advertir
  if (isAdmin) {
    await conn.sendMessage(m.chat, {
      react: { text: '⚠️', key: m.key }
    });
    return;
  }

  // Enlaces permitidos
  const allowedDomains = [
    'youtube.com', 'youtu.be', 'tiktok.com', 'vm.tiktok.com',
    'instagram.com', 'facebook.com', 'fb.com', 'twitter.com', 'x.com'
  ];

  // Extraer todos los enlaces del mensaje
  const links1 = m.text.match(generalLinkRegex) || [];
  const links2 = m.text.match(enhancedLinkRegex) || [];
  const allLinks = [...new Set([...links1, ...links2])];

  // Verificar si todos los enlaces son permitidos
  const allLinksAllowed = allLinks.every(link => {
    try {
      const fullLink = link.startsWith('http') ? link : `https://${link}`;
      const domain = new URL(fullLink).hostname.replace('www.', '');
      return allowedDomains.some(allowed => domain.includes(allowed));
    } catch {
      return false;
    }
  });

  // Si todos los enlaces son permitidos, no hacer nada
  if (allLinksAllowed) return;

  // Si NO es admin y tiene enlaces no permitidos
  if (!isBotAdmin) {
    await conn.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    });
    return;
  }

  try {
    // Acciones rápidas
    await Promise.all([
      // Reacción
      conn.sendMessage(m.chat, {
        react: { text: '🚫', key: m.key }
      }).catch(() => {}),

      // Eliminar mensaje
      conn.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: m.key.id,
          participant: m.key.participant
        }
      }),

      // Mensaje breve
      conn.sendMessage(m.chat, {
        text: `🚫 *Karbot - AntiLink*\n\n${user} Enlaces no permitidos`,
        mentions: [m.sender]
      }, { quoted: m }),

      // Expulsar usuario
      conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
    ]);

  } catch (error) {
    // Error silenciado
    await conn.sendMessage(m.chat, {
      react: { text: '💢', key: m.key }
    });
  }
}