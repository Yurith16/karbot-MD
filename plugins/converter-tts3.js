/* Desarrollado y Creado por: HERNANDEZ - KARBOT-MD */

import fetch from 'node-fetch';

const handler = async (m, { conn, usedPrefix, command, text }) => {
  const match = text.match(/^(\w+)\s*\|\s*(.+)/i);
  if (!match) {
    const voices = await getVoices();
    const voiceNames = voices.voices.map(voice => voice.name).join('\n• ');
    return m.reply(`🎙️ *FORMATO INCORRECTO - FALTAN DATOS*\n\n📝 *Ejemplo de uso:*\n• ${usedPrefix + command} ${voices.voices[0].name} | este es un texto de ejemplo\n\n🗣️ *Voces disponibles:*\n• ${voiceNames}`);
  }
  
  const [, voiceName, inputText] = match;
  const voices = await getVoices();
  const voice = voices.voices.find(voice => voice.name.toLowerCase() === voiceName.toLowerCase());
  
  if (!voice) {
    const voiceNames = voices.voices.map(voice => voice.name).join('\n• ');
    return m.reply(`❌ *VOZ NO ENCONTRADA: "${voiceName}"*\n\n🗣️ *Voces disponibles:*\n• ${voiceNames}`);
  }
  
  const audio = await convertTextToSpeech(inputText, voice.voice_id);
  if (audio) {
    conn.sendMessage(m.chat, { 
      audio: audio.audio, 
      fileName: `karbot-tts3.mp3`, 
      mimetype: 'audio/mpeg', 
      ptt: false // Cambiado a false para mejor reproducción
    }, { quoted: m });
  } else {
    m.reply('❌ *ERROR AL GENERAR EL AUDIO*');
  }
};

handler.help = ['tts3'];
handler.tags = ['converter'];
handler.command = ['tts3'];

export default handler;

const apiKey = 'a0e2c6022f1aeb28b5020b1dd0faf6ee';

const getVoices = async () => {
  const url = 'https://api.elevenlabs.io/v1/voices';
  const options = { 
    method: 'GET', 
    headers: { 
      'Content-Type': 'application/json', 
      'xi-api-key': apiKey 
    }
  };
  
  try {
    const response = await fetch(url, options);
    const voices = await response.json();
    return voices;
  } catch (error) {
    console.error('❌ Error al obtener las voces:', error);
    return { voices: [] };
  }
};

const convertTextToSpeech = async (text, voiceId) => {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  const options = { 
    method: 'POST', 
    headers: { 
      'Content-Type': 'application/json', 
      'xi-api-key': apiKey 
    }, 
    body: JSON.stringify({ 
      text: text, 
      model_id: 'eleven_monolingual_v1', 
      voice_settings: { 
        stability: 0.5, 
        similarity_boost: 0.5 
      }
    })
  };
  
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    const audioBuffer = await response.buffer();
    return { audio: audioBuffer };
  } catch (error) {
    console.error('❌ Error al generar el audio:', error);
    return null;  
  }
};