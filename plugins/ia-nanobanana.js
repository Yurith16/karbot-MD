/* Creador: HERNANDEZ */

import fs from 'fs';
import { img2img } from '../src/libraries/nanobanana.js';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || q.mediaType || '';

  if (!/image/g.test(mime)) throw `*⚠️ ¡Responde a una imagen para usar este comando!*`;
  if (!text) throw `*✍️ Por favor, escribe la descripción de cómo quieres que edite la imagen.*\n*Ejemplo: ${usedPrefix + command} perro de raza pitbull con sombrero y gafas de sol*`;

  const data = await q.download?.();

  try {
    const resultBuffer = await img2img(data, text);
    await conn.sendMessage(m.chat, { image: resultBuffer, caption: `*✅ ¡Aquí tienes tu imagen editada!*` }, { quoted: m });
  } catch (error) {
    console.error(error);
    throw `*❌ Ocurrió un error al procesar tu solicitud. Inténtalo de nuevo más tarde.*`;
  }
};

handler.help = ['nanobanana <prompt>'];
handler.tags = ['ai', 'converter'];
handler.command = ['nanobanana'];

export default handler;