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

  // Si es admin, solo advertir silenciosamente
  if (isAdmin) {
    await conn.sendMessage(m.chat, {
      react: {
        text: '⚠️',
        key: m.key
      }
    });
    return;
  }

  // Enlaces permitidos
  const allowedDomains = [
    'youtube.com',
    'youtu.be',
    'tiktok.com',
    'vm.tiktok.com',
    'instagram.com',
    'facebook.com',
    'fb.com',
    'twitter.com',
    'x.com'
  ];

  // Dominios de Telegram que deben bloquearse PRIORITARIAMENTE
  const telegramDomains = [
    't.me',
    'telegram.me',
    'telegram.org'
  ];

  // Extraer todos los enlaces del mensaje
  const links1 = m.text.match(generalLinkRegex) || [];
  const links2 = m.text.match(enhancedLinkRegex) || [];
  const allLinks = [...new Set([...links1, ...links2])];

  // Verificar si hay enlaces de Telegram (prioridad máxima)
  const hasTelegramLinks = allLinks.some(link => {
    try {
      const fullLink = link.startsWith('http') ? link : `https://${link}`;
      const domain = new URL(fullLink).hostname.replace('www.', '');
      return telegramDomains.some(tg => domain.includes(tg));
    } catch {
      return false;
    }
  });

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
  if (allLinksAllowed && !hasTelegramLinks) return;

  // Si NO es admin y tiene enlaces no permitidos, aplicar acciones
  console.log(`Enlace no permitido detectado de usuario: ${user}`);

  // Verificar si el bot es admin
  if (!isBotAdmin) {
    await conn.sendMessage(m.chat, {
      react: {
        text: '❌',
        key: m.key
      }
    });
    return;
  }

  try {
    // Ejecutar acciones rápidas
    const actions = [];

    // 1. Reacción silenciosa
    actions.push(
      conn.sendMessage(m.chat, {
        react: {
          text: '🚫',
          key: m.key
        }
      }).catch(() => {})
    );

    // 2. Eliminar el mensaje con el enlace (INMEDIATO)
    actions.push(
      conn.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: m.key.id,
          participant: m.key.participant
        }
      })
    );

    // 3. Mensaje breve al usuario
    actions.push(
      conn.sendMessage(m.chat, {
        text: `*${user}* No se permiten enlaces 👀`,
        mentions: [m.sender]
      }, { quoted: m })
    );

    // 4. Expulsar al usuario (INMEDIATO)
    actions.push(
      conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
    );

    // Ejecutar todas las acciones simultáneamente
    await Promise.all(actions);

    console.log(`Usuario ${user} expulsado por enlace no permitido`);

  } catch (error) {
    console.error('Error en anti-link:', error);
    await conn.sendMessage(m.chat, {
      react: {
        text: '💥',
        key: m.key
      }
    });
  }
}