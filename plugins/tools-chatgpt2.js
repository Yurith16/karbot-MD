import axios from 'axios';
import fs from 'fs';

let handler = async (m, { conn, text, command, usedPrefix }) => {
  // Sistema de reacción - indicar procesamiento
  await conn.sendMessage(m.chat, { react: { text: '🤖', key: m.key } });

  try {  
    // Comando para borrar memoria
    if (command === 'delmemoryia' || command === 'borrarmemoriaai') {
      if (!global.db.data.users) global.db.data.users = {};
      if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {};
      global.db.data.users[m.sender].chatHistory = [];
      if (typeof global.db.write === 'function') global.db.write();

      await conn.sendMessage(m.chat, { react: { text: '🗑️', key: m.key } });
      return m.reply('*🗑️ MEMORIA BORRADA*\n\n_La memoria de conversación ha sido eliminada exitosamente._\n\n*¡Listo! Ya no recordaré nuestras conversaciones anteriores.*');
    }

    if (!text) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return m.reply(`*🤖 FALTA EL TEXTO*\n\n_Escribe tu pregunta o mensaje después del comando_\n\n*Ejemplo:*\n*${usedPrefix + command} ¿cómo funciona la inteligencia artificial?*`);
    }

    // Reacción de procesamiento
    await conn.sendMessage(m.chat, { react: { text: '💭', key: m.key } });

    const model = await axios.get("https://raw.githubusercontent.com/Skidy89/chat-gpt-jailbreak/refs/heads/main/Text.txt");
    const context = `${model.data}`.trim();

    const result = await luminsesi(text, m.sender, context);

    // Reacción de éxito
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    m.reply(result);
  } catch (error) {
    // Reacción de error
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    console.error('[❌ ERROR IA]', error);
    m.reply('*❌ ERROR EN LA IA*\n\n_No se pudo procesar tu solicitud. Intenta nuevamente en unos momentos._');
  }
};

handler.help = ['exploit <texto>', 'delmemoryia'];
handler.tags = ['ai'];
handler.command = /^(xexploit|ia2|exploit|ia|chatgpt|ai|delmemoryia|borrarmemoriaai)$/i;
export default handler;

function getUserHistory(sender) {
  if (!global.db.data.users) global.db.data.users = {};
  if (!global.db.data.users[sender]) {
    global.db.data.users[sender] = {};
  }
  if (!global.db.data.users[sender].chatHistory) {
    global.db.data.users[sender].chatHistory = [];
  }
  return global.db.data.users[sender].chatHistory;
}

function saveUserMessage(sender, role, content) {
  if (!content || typeof content !== 'string') return;
  if (!global.db.data.users) global.db.data.users = {};
  if (!global.db.data.users[sender]) global.db.data.users[sender] = {};
  if (!global.db.data.users[sender].chatHistory) global.db.data.users[sender].chatHistory = [];

  global.db.data.users[sender].chatHistory.push({ role, content });

  if (global.db.data.users[sender].chatHistory.length > 10) {
    global.db.data.users[sender].chatHistory = global.db.data.users[sender].chatHistory.slice(-10);
  }

  if (typeof global.db.write === 'function') global.db.write();
}

async function luminsesi(prompt, sender, contextLogic = '') {
  saveUserMessage(sender, 'user', prompt);
  const messages = getUserHistory(sender);
  const logic = contextLogic || 'Tú eres un bot llamado KARBOT-MD, siempre educado y útil.';

  try {
    const { data } = await axios.post('https://api.manaxu.my.id/api/v1/ai', 
      { logic, messages },  
      { headers: { 'x-api-key': 'key-manaxu-free' } }
    );
    const result = data.result;
    saveUserMessage(sender, 'assistant', result);
    return result;
  } catch (err) {
    console.error('❌ API Error:', err.response?.data || err.message);
    return '*⚠️ ERROR DE CONEXIÓN*\n\n_No se pudo contactar con el servicio de IA. Intenta nuevamente en unos momentos._';
  }
}