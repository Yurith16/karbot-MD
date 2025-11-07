const handler = async (m, {conn, usedPrefix, command, args, isOwner, isAdmin, isROwner}) => {
  // Reacción de carga
  try {
      await conn.sendMessage(m.chat, {
          react: {
              text: '⚙️',
              key: m.key
          }
      });
  } catch (reactError) {}

  const optionsFull = `*「⚙️」 Configuración del Bot*\n\n` +

`*🎯 WELCOME*
> ✦ *Comando:* » ${usedPrefix + command} welcome
> ✦ *Función:* » Mensaje de bienvenida al grupo

────────────────

*🌐 PUBLIC* 
> ✦ *Comando:* » ${usedPrefix + command} public
> ✦ *Función:* » Modo público del bot

────────────────

*🔞 MODOHORNY*
> ✦ *Comando:* » ${usedPrefix + command} modohorny
> ✦ *Función:* » Activar/desactivar contenido +18

────────────────

*🔗 ANTILINK*
> ✦ *Comando:* » ${usedPrefix + command} antilink
> ✦ *Función:* » Bloquear enlaces en el grupo

────────────────

*🔗 ANTILINK 2*
> ✦ *Comando:* » ${usedPrefix + command} antilink2
> ✦ *Función:* » Sistema alterno anti-enlaces

────────────────

*👀 DETECT*
> ✦ *Comando:* » ${usedPrefix + command} detect
> ✦ *Función:* » Detectar eventos del grupo

────────────────

*👀 DETECT 2*
> ✦ *Comando:* » ${usedPrefix + command} detect2
> ✦ *Función:* » Sistema mejorado de detección

────────────────

*🚫 RESTRICT*
> ✦ *Comando:* » ${usedPrefix + command} restrict
> ✦ *Función:* » Restricciones del bot

────────────────

*📖 AUTOREAD*
> ✦ *Comando:* » ${usedPrefix + command} autoread
> ✦ *Función:* » Lectura automática de mensajes

────────────────

*🎵 AUDIOS*
> ✦ *Comando:* » ${usedPrefix + command} audios
> ✦ *Función:* » Comandos de audio en el grupo

────────────────

*🔄 AUTOSTICKER*
> ✦ *Comando:* » ${usedPrefix + command} autosticker 
> ✦ *Función:* » Conversión automática a sticker

────────────────

*💻 PCONLY*
> ✦ *Comando:* » ${usedPrefix + command} pconly
> ✦ *Función:* » Solo uso en privado

────────────────

*👥 GCONLY*
> ✦ *Comando:* » ${usedPrefix + command} gconly
> ✦ *Función:* » Solo uso en grupos

────────────────

*👁️ ANTIVIEWONCE*
> ✦ *Comando:* » ${usedPrefix + command} antiviewonce
> ✦ *Función:* » Bloquear viewonce

────────────────

*📞 ANTILLAMADAS*
> ✦ *Comando:* » ${usedPrefix + command} anticall
> ✦ *Función:* » Bloquear llamadas

────────────────

*🚫 ANTITOXIC*
> ✦ *Comando:* » ${usedPrefix + command} antitoxic
> ✦ *Función:* » Detectar lenguaje ofensivo

────────────────

*🛡️ ANTITRABAS*
> ✦ *Comando:* » ${usedPrefix + command} antitraba
> ✦ *Función:* » Bloquear spam y trabas

────────────────

*🌍 ANTIARABES*
> ✦ *Comando:* » ${usedPrefix + command} antiarabes
> ✦ *Función:* » Protección regional

────────────────

*🌍 ANTIARABES 2*
> ✦ *Comando:* » ${usedPrefix + command} antiarabes2
> ✦ *Función:* » Protección regional mejorada

────────────────

*👑 MODOADMIN*
> ✦ *Comando:* » ${usedPrefix + command} modoadmin
> ✦ *Función:* » Solo admins pueden usar comandos

────────────────

*🤖 SIMSIMI*
> ✦ *Comando:* » ${usedPrefix + command} simsimi
> ✦ *Función:* » Chat inteligente

────────────────

*🗑️ ANTIDELETE*
> ✦ *Comando:* » ${usedPrefix + command} antidelete
> ✦ *Función:* » Detectar mensajes eliminados

────────────────

*🤖 AUDIOS_BOT*
> ✦ *Comando:* » ${usedPrefix + command} audios_bot
> ✦ *Función:* » Audios del bot

────────────────

*🚫 ANTISPAM*
> ✦ *Comando:* » ${usedPrefix + command} antispam
> ✦ *Función:* » Protección contra spam

────────────────

*🔌 MODEJADIBOT*
> ✦ *Comando:* » ${usedPrefix + command} modejadibot
> ✦ *Función:* » Modo sub-bot

────────────────

*🔒 ANTIPRIVADO*
> ✦ *Comando:* » ${usedPrefix + command} antiprivado
> ✦ *Función:* » Bloquear mensajes privados`.trim();

const isEnable = /true|enable|(turn)?on|1/i.test(command);
const chat = global.db.data.chats[m.chat];
const user = global.db.data.users[m.sender];
const bot = global.db.data.settings[conn.user.jid] || {};
const type = (args[0] || '').toLowerCase();
let isAll = false; const isUser = false;

switch (type) {
  case 'welcome':
    if (!m.isGroup) {
      if (!isOwner) {
        global.dfail('group', m, conn);
        throw false;
      }
    } else if (!(isAdmin || isOwner || isROwner)) {
      global.dfail('admin', m, conn);
      throw false;
    }
    chat.welcome = isEnable;
    break;
  case 'detect':
    if (!m.isGroup) {
      if (!isOwner) {
        global.dfail('group', m, conn);
        throw false;
      }
    } else if (!isAdmin) {
      global.dfail('admin', m, conn);
      throw false;
    }
    chat.detect = isEnable;
    break;
  case 'detect2':
    if (!m.isGroup) {
      if (!isOwner) {
        global.dfail('group', m, conn);
        throw false;
      }
    } else if (!isAdmin) {
      global.dfail('admin', m, conn);
      throw false;
    }
    chat.detect2 = isEnable;
    break;
  case 'simsimi':
    if (m.isGroup) {
      if (!(isAdmin || isROwner || isOwner)) {
        global.dfail('admin', m, conn);
        throw false;
      }
    }
    chat.simi = isEnable;
    break;
  case 'antiporno':
    if (m.isGroup) {
      if (!(isAdmin || isOwner)) {
        global.dfail('admin', m, conn);
        throw false;
      }
    }
    chat.antiporno = isEnable;
    break;
  case 'delete':
    if (m.isGroup) {
      if (!(isAdmin || isOwner)) {
        global.dfail('admin', m, conn);
        throw false;
      }
    }
    chat.delete = isEnable;
    break;
  case 'antidelete':
    if (m.isGroup) {
      if (!(isAdmin || isOwner)) {
        global.dfail('admin', m, conn);
        throw false;
      }
    }
    chat.antidelete = isEnable;
    break;
  case 'public':
    isAll = true;
    if (!isROwner) {
      global.dfail('rowner', m, conn);
      throw false;
    }
    global.opts['self'] = !isEnable;
    break;
  case 'antilink':
    if (m.isGroup) {
      if (!(isAdmin || isOwner)) {
        global.dfail('admin', m, conn);
        throw false;
      }
    }
    chat.antiLink = isEnable;
    break;
  case 'antilink2':
    if (m.isGroup) {
      if (!(isAdmin || isOwner)) {
        global.dfail('admin', m, conn);
        throw false;
      }
    }
    chat.antiLink2 = isEnable;
    break;
  case 'antiviewonce':
    if (m.isGroup) {
      if (!(isAdmin || isOwner)) {
        global.dfail('admin', m, conn);
        throw false;
      }
    }
    chat.antiviewonce = isEnable;
    break;
  case 'modohorny':
    if (m.isGroup) {
      if (!(isAdmin || isROwner || isOwner)) {
        global.dfail('admin', m, conn);
        throw false;
      }
    }
    chat.modohorny = isEnable;
    break;
  case 'modoadmin':
    if (m.isGroup) {
      if (!(isAdmin || isROwner || isOwner)) {
        global.dfail('admin', m, conn);
        throw false;
      }
    }
    chat.modoadmin = isEnable;
    break;
  case 'autosticker':
    if (m.isGroup) {
      if (!(isAdmin || isROwner || isOwner)) {
        global.dfail('admin', m, conn);
        throw false;
      }
    }
    chat.autosticker = isEnable;
    break;
  case 'audios':
    if (m.isGroup) {
      if (!(isAdmin || isROwner || isOwner)) {
        global.dfail('admin', m, conn);
        throw false;
      }
    }
    chat.audios = isEnable;
    break;
  case 'restrict':
    isAll = true;
    if (!(isROwner || isOwner)) {
      global.dfail('owner', m, conn);
      throw false;
    }
    bot.restrict = isEnable;
    break;
  case 'audios_bot':
    isAll = true;
    if (!(isROwner || isOwner)) {
      global.dfail('owner', m, conn);
      throw false;
    }
    bot.audios_bot = isEnable;      
    break;      
  case 'nyimak':
    isAll = true;
    if (!isROwner) {
      global.dfail('rowner', m, conn);
      throw false;
    }
    global.opts['nyimak'] = isEnable;
    break;
  case 'autoread':
    isAll = true;
    if (!(isROwner || isOwner)) {
      global.dfail('rowner', m, conn);
      throw false;
    }
    bot.autoread2 = isEnable;
    break;
  case 'pconly':
  case 'privateonly':
    isAll = true;
    if (!isROwner) {
      global.dfail('rowner', m, conn);
      throw false;
    }
    global.opts['pconly'] = isEnable;
    break;
  case 'gconly':
  case 'grouponly':
    isAll = true;
    if (!isROwner) {
      global.dfail('rowner', m, conn);
      throw false;
    }
    global.opts['gconly'] = isEnable;
    break;
  case 'swonly':
  case 'statusonly':
    isAll = true;
    if (!isROwner) {
      global.dfail('rowner', m, conn);
      throw false;
    }
    global.opts['swonly'] = isEnable;
    break;
  case 'anticall':
    isAll = true;
    if (!(isROwner || isOwner)) {
      global.dfail('owner', m, conn);
      throw false;
    }
    bot.antiCall = isEnable;
    break;
  case 'antiprivado':
    isAll = true;
    if (!(isROwner || isOwner)) {
      global.dfail('owner', m, conn);
      throw false;
    }
    bot.antiPrivate = isEnable;
    break;
  case 'modejadibot':
    isAll = true;
    if (!isROwner) {
      global.dfail('rowner', m, conn);
      throw false;
    }
    bot.modejadibot = isEnable;
    break;
  case 'antispam':
    isAll = true;
    if (!(isROwner || isOwner)) {
      global.dfail('owner', m, conn);
      throw false;
    }
    bot.antispam = isEnable;
    break;
  case 'antitoxic':
    if (m.isGroup) {
      if (!(isAdmin || isROwner || isOwner)) {
        global.dfail('admin', m, conn);
        throw false;
      }
    }
    chat.antiToxic = isEnable;
    break;
  case 'game': case 'juegos': case 'fun': case 'ruleta':
    if (m.isGroup) {
      if (!(isAdmin || isOwner)) {
        global.dfail('admin', m, conn)
        throw false
      }
    }
    chat.game = isEnable          
    break;
  case 'antitraba':
    if (m.isGroup) {
      if (!(isAdmin || isROwner || isOwner)) {
        global.dfail('admin', m, conn);
        throw false;
      }
    }
    chat.antiTraba = isEnable;
    break;
  case 'antiarabes':
    if (m.isGroup) {
      if (!(isAdmin || isROwner || isOwner)) {
        global.dfail('admin', m, conn); 
        throw false;
      }
    }
    chat.antiArab = isEnable;
    break;
  case 'antiarabes2':
    if (m.isGroup) {
      if (!(isAdmin || isROwner || isOwner)) {
        global.dfail('admin', m, conn);
        throw false;
      }
    }
    chat.antiArab2 = isEnable;
    break;
  default:
    if (!/[01]/.test(command)) return await conn.sendMessage(m.chat, {text: optionsFull}, {quoted: m});
    throw false;
}

// Reacción de éxito
try {
  await conn.sendMessage(m.chat, {
    react: {
      text: '✅',
      key: m.key
    }
  });
} catch (reactError) {}

await conn.sendMessage(m.chat, {
  text: `*「⚙️」 Configuración Actualizada*\n\n` +
        `> ✦ *Función:* » ${type}\n` +
        `> ✦ *Estado:* » ${isEnable ? 'Activada' : 'Desactivada'}\n` +
        `> ✦ *Ámbito:* » ${isAll ? 'Todo el bot' : 'Este chat'}`
}, {quoted: m});
};

handler.command = /^((en|dis)able|(tru|fals)e|(turn)?[01])$/i;
export default handler;