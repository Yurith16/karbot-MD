import axios from 'axios';

const handler = async (m, { conn, args }) => {
  const input = args.join(' ').trim();

  if (!input) {
    return await conn.sendMessage(m.chat, {
      text: `*「❌」 Falta Descripción*\n\n> ✦ *Ingresa lo que quieres generar*\n> ✦ *Ejemplo:* » .dalle un paisaje futurista`
    }, { quoted: m });
  }

  try {
    // Reacción de procesamiento
    await conn.sendMessage(m.chat, {
      react: { text: '🎨', key: m.key }
    });

    const prompt = encodeURIComponent(input);
    const url = `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=1024&nologo=true&safe=true`;

    await conn.sendMessage(m.chat, {
      image: { url: url },
      caption: `*「🎨」 Imagen Generada*\n\n> ✦ *Prompt:* » ${input}\n> ✦ *Estilo:* » Automático\n> ✦ *Por:* » Karbot`
    }, { quoted: m });

    // Reacción de éxito
    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    });

  } catch (error) {
    console.error('Error en dalle:', error);

    await conn.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    });

    await conn.sendMessage(m.chat, {
      text: `*「❌」 Error de Generación*\n\n> ✦ *Error:* » ${error.message}\n> ✦ *Intenta con otro prompt*`
    }, { quoted: m });
  }
};

handler.command = ['dalle', 'genera', 'imagina', 'aiimage'];
export default handler;