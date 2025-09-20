const handler = async (m, {conn, usedPrefix, command, args, isOwner, isAdmin, isROwner}) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.config_funciones;

  // Función para crear separadores estéticos
  const separator = '┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅';

  // Crear un mensaje más estético con formato mejorado
  const optionsFull = `
╔═══════════════════════════════╗
║    🛠️  ${tradutor.texto1[0].toUpperCase()} 🛠️     ║
╚═══════════════════════════════╝

${separator}

✨  ${tradutor.texto1[1]} | WELCOME
🔹 ${tradutor.texto1[2]} ${usedPrefix + command} welcome
🔹 ${tradutor.texto1[3]}

${separator}

🌎 ${tradutor.texto2[0]} | PUBLIC
🔹 ${tradutor.texto2[1]} ${usedPrefix + command} public
🔹 ${tradutor.texto2[2]}
🔹 ${tradutor.texto2[3]}

${separator}

🥵 ${tradutor.texto3[0]} | MODOHORNY
🔹 ${tradutor.texto3[1]} ${usedPrefix + command} modohorny
🔹 ${tradutor.texto3[2]}

${separator}

🔗 ${tradutor.texto4[0]} | ANTILINK
🔹 ${tradutor.texto4[1]} ${usedPrefix + command} antilink
🔹 ${tradutor.texto4[2]}
🔹 ${tradutor.texto4[3]}

${separator}

🔗 ${tradutor.texto5[0]} | ANTILINK 2
🔹 ${tradutor.texto5[1]} ${usedPrefix + command} antilink2
🔹 ${tradutor.texto5[2]}
🔹 ${tradutor.texto5[3]}

${separator}

🔎 ${tradutor.texto6[0]} | DETECT
🔹 ${tradutor.texto6[1]} ${usedPrefix + command} detect
🔹 ${tradutor.texto6[2]}

${separator}

🔎 ${tradutor.texto7[0]} | DETECT 2
🔹 ${tradutor.texto7[1]} ${usedPrefix + command} detect2
🔹 ${tradutor.texto7[2]}

${separator}

❗ ${tradutor.texto8[0]} | RESTRICT
🔹 ${tradutor.texto8[1]} ${usedPrefix + command} restrict
🔹 ${tradutor.texto8[2]}
🔹 ${tradutor.texto8[3]}

${separator}

☑️ ${tradutor.texto9[0]} | AUTOREAD
🔹 ${tradutor.texto9[1]} ${usedPrefix + command} autoread
🔹 ${tradutor.texto9[2]}
🔹 ${tradutor.texto9[3]}

${separator}

🔊 ${tradutor.texto10[0]} | AUDIOS
🔹 ${tradutor.texto10[1]} ${usedPrefix + command} audios
🔹 ${tradutor.texto10[2]}

${separator}

👾 ${tradutor.texto11[0]} | AUTOSTICKER
🔹 ${tradutor.texto11[1]} ${usedPrefix + command} autosticker 
🔹 ${tradutor.texto11[2]}

${separator}

💬 ${tradutor.texto12[0]} | PCONLY
🔹 ${tradutor.texto12[1]} ${usedPrefix + command} pconly
🔹 ${tradutor.texto12[2]}
🔹 ${tradutor.texto12[3]}

${separator}

🏢 ${tradutor.texto13[0]} | GCONLY
🔹 ${tradutor.texto13[1]} ${usedPrefix + command} gconly
🔹 ${tradutor.texto13[2]} 
🔹 ${tradutor.texto13[3]}

${separator}

❌ ${tradutor.texto14[0]} | ANTIVIEWONCE 
🔹 ${tradutor.texto14[1]} ${usedPrefix + command} antiviewonce
🔹 ${tradutor.texto14[2]}

${separator}

📵 ${tradutor.texto15[0]} | ANTILLAMADAS
🔹 ${tradutor.texto15[1]} ${usedPrefix + command} anticall
🔹 ${tradutor.texto15[2]} 
🔹 ${tradutor.texto15[3]}

${separator}

🤬 ${tradutor.texto16[0]} | ANTITOXIC
🔹 ${tradutor.texto16[1]} ${usedPrefix + command} antitoxic
🔹 ${tradutor.texto16[2]}
🔹 ${tradutor.texto16[3]}

${separator}

🕸️ ${tradutor.texto17[0]} | ANTITRABAS
🔹 ${tradutor.texto17[1]} ${usedPrefix + command} antitraba
🔹 ${tradutor.texto17[2]} 
🔹 ${tradutor.texto17[3]} 

${separator}

👎 ${tradutor.texto18[0]} | ANTIARABES
🔹 ${tradutor.texto18[1]} ${usedPrefix + command} antiarabes
🔹 ${tradutor.texto18[2]}
🔹 ${tradutor.texto18[3]}

${separator}

👎 ${tradutor.texto19[0]} | ANTIARABES 2
🔹 ${tradutor.texto19[1]} ${usedPrefix + command} antiarabes2
🔹 ${tradutor.texto19[2]} 
🔹 ${tradutor.texto19[3]} 

${separator}

👑 ${tradutor.texto20[0]} | MODOADMIN
🔹 ${tradutor.texto20[1]} ${usedPrefix + command} modoadmin
🔹 ${tradutor.texto20[2]}

${separator}

😃 ${tradutor.texto21[0]} | SIMSIMI
🔹 ${tradutor.texto21[1]} ${usedPrefix + command} simsimi
🔹 ${tradutor.texto21[2]}

${separator}

🛡️ ${tradutor.texto22[0]} | ANTIDELETE
🔹 ${tradutor.texto22[1]} ${usedPrefix + command} antidelete
🔹 ${tradutor.texto22[2]}

${separator}

🔊 ${tradutor.texto23[0]} | AUDIOS_BOT
🔹 ${tradutor.texto23[1]} ${usedPrefix + command} audios_bot
🔹 ${tradutor.texto23[2]}
🔹 ${tradutor.texto23[3]}

${separator}

⏳ ${tradutor.texto24[0]} | ANTISPAM
🔹 ${tradutor.texto24[1]} ${usedPrefix + command} antispam
🔹 ${tradutor.texto24[2]}
🔹 ${tradutor.texto24[3]}

${separator}

🤖 ${tradutor.texto25[0]} | MODEJADIBOT
🔹 ${tradutor.texto25[1]} ${usedPrefix + command} modejadibot
🔹 ${tradutor.texto25[2]} (${usedPrefix}serbot / ${usedPrefix}jadibot). 
🔹 ${tradutor.texto25[3]}

${separator}

💬 ${tradutor.texto26[0]} | ANTIPRIVADO
🔹 ${tradutor.texto26[1]} ${usedPrefix + command} antiprivado
🔹 ${tradutor.texto26[2]}
🔹 ${tradutor.texto26[3]}

╔═══════════════════════════════╗
║     🛠️  USO: ${usedPrefix}enable opción     ║
╚═══════════════════════════════╝
`.trim();

  // El resto del código se mantiene igual...
  const isEnable = /true|enable|(turn)?on|1/i.test(command);
  const chat = global.db.data.chats[m.chat];
  const user = global.db.data.users[m.sender];
  const bot = global.db.data.settings[conn.user.jid] || {};
  const type = (args[0] || '').toLowerCase();
  let isAll = false; const isUser = false;
  
  // ... (switch case y lógica de configuración permanece igual)
  
  // Mensaje de confirmación más estético
  const status = isEnable ? '✅ ACTIVADA' : '❌ DESACTIVADA';
  const scope = isAll ? 'bot' : isUser ? 'usuario' : 'chat';
  
  conn.sendMessage(m.chat, {
    text: `
╔══════════════════════╗
║     🛠️ CONFIGURACIÓN     ║
╚══════════════════════╝

🔹 *Opción:* ${type}
🔹 *Estado:* ${status}
🔹 *Ámbito:* ${scope}

${tradutor.texto27[0]} ${type} ${tradutor.texto27[1]} ${isEnable ? 'activada' : 'desactivada'} ${tradutor.texto27[2]} ${isAll ? 'bot' : isUser ? '' : 'chat'}.
    `.trim()
  }, {quoted: m});
};

handler.command = /^((en|dis)able|(tru|fals)e|(turn)?[01])$/i;
export default handler;