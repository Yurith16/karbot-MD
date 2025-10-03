import { sticker } from '../src/libraries/sticker.js';
import uploadFile from '../src/libraries/uploadFile.js';
import uploadImage from '../src/libraries/uploadImage.js';
import { webp2png } from '../src/libraries/webp2mp4.js';
import fs from 'fs';
import path from 'path';
import Crypto from 'crypto';
import ffmpeg from 'fluent-ffmpeg';
import webp from 'node-webpmux';

const tempFolder = path.join(process.cwd(), 'tmp');
if (!fs.existsSync(tempFolder)) fs.mkdirSync(tempFolder, { recursive: true });

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (usedPrefix == 'a' || usedPrefix == 'A') return;

  let stiker = false;

  try {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || q.mediaType || '';

    // Reacción de procesamiento
    await conn.sendMessage(m.chat, {
      react: { text: '🛠️', key: m.key }
    });

    if (/webp|image|video/g.test(mime)) {
      const img = await q.download?.();
      if (!img) throw `*⚠️ Responde a una imagen o video con el comando* \`\`\`${usedPrefix + command}\`\`\` *para crear un sticker.*`;

      // Usar el nuevo sistema de stickers con mejor calidad
      const metadata = {
        packname: global.packname || "",
        author: global.author || "𓊈🍃KarBot🍃𓊉",
        categories: ["✨"]
      };

      // Determinar tipo de media y procesar
      if (/image/g.test(mime) && !/webp/g.test(mime)) {
        stiker = await writeExifImg(img, metadata);
      } else if (/video/g.test(mime)) {
        stiker = await writeExifVid(img, metadata);
      } else if (/webp/g.test(mime)) {
        // Para webp, usar el método original
        stiker = await sticker(img, false, global.packname, global.author, ["✨"], { isAiSticker: true });
      }

      // Si el nuevo método falla, usar el método original como fallback
      if (!stiker) {
        let out;
        try {
          stiker = await sticker(img, false, global.packname, global.author, ["✨"], { isAiSticker: true });
        } catch (e) {
          console.error('Fallback al método original:', e);
          if (/webp/g.test(mime)) out = await webp2png(img);
          else if (/image/g.test(mime)) out = await uploadImage(img);
          else if (/video/g.test(mime)) out = await uploadFile(img);
          if (typeof out !== 'string') out = await uploadImage(img);
          stiker = await sticker(false, out, global.packname, global.author, ["✨"], { isAiSticker: true });
        }
      }

    } else if (args[0]) {
      if (isUrl(args[0])) {
        // Para URLs, usar el método original
        stiker = await sticker(false, args[0], global.packname, global.author, ["✨"], { isAiSticker: true });
      } else {
        return m.reply(`*⚠️ Ingresa una URL válida de una imagen.*\n*Ejemplo:* ${usedPrefix}s https://telegra.ph/file/0dc687c61410765e98de2.jpg`);
      }
    } else {
      return m.reply(`*⚠️ Responde a una imagen o video con el comando* \`\`\`${usedPrefix + command}\`\`\` *para crear un sticker.*`);
    }

  } catch (e) {
    console.error('Error principal:', e);
    if (!stiker) stiker = e;
  } finally {
    if (stiker) {
      // Enviar el sticker creado
      if (typeof stiker === 'string' && fs.existsSync(stiker)) {
        // Si es una ruta de archivo del nuevo sistema
        await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m);
        // Limpiar archivo temporal después de enviar
        setTimeout(() => {
          try {
            if (fs.existsSync(stiker)) fs.unlinkSync(stiker);
          } catch (cleanError) {
            console.error('Error al limpiar archivo temporal:', cleanError);
          }
        }, 5000);
      } else {
        // Si es un buffer del sistema original
        conn.sendFile(m.chat, stiker, 'sticker.webp', '', m);
      }

      // Reacción de éxito
      await conn.sendMessage(m.chat, {
        react: { text: '✅', key: m.key }
      });
    } else {
      await conn.sendMessage(m.chat, {
        react: { text: '❌', key: m.key }
      });
      return m.reply(`*❌ Ocurrió un error al crear el sticker. Intenta nuevamente con* \`\`\`${usedPrefix + command}\`\`\``);
    }
  }
};

handler.help = ['sfull'];
handler.tags = ['sticker'];
handler.command = /^s(tic?ker)?(gif)?(wm)?$/i;

export default handler;

/* === FUNCIONES MEJORADAS PARA STICKERS === */

async function imageToWebp(media) {
  const tmpIn = path.join(tempFolder, randomFileName('jpg'));
  const tmpOut = path.join(tempFolder, randomFileName('webp'));
  fs.writeFileSync(tmpIn, media);

  await new Promise((resolve, reject) => {
    ffmpeg(tmpIn)
      .on('error', reject)
      .on('end', resolve)
      .addOutputOptions([
        "-vcodec", "libwebp",
        "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse"
      ])
      .toFormat('webp')
      .save(tmpOut);
  });

  const buff = fs.readFileSync(tmpOut);
  fs.unlinkSync(tmpIn);
  fs.unlinkSync(tmpOut);
  return buff;
}

async function videoToWebp(media) {
  const tmpIn = path.join(tempFolder, randomFileName('mp4'));
  const tmpOut = path.join(tempFolder, randomFileName('webp'));
  fs.writeFileSync(tmpIn, media);

  await new Promise((resolve, reject) => {
    ffmpeg(tmpIn)
      .on('error', reject)
      .on('end', resolve)
      .addOutputOptions([
        "-vcodec", "libwebp",
        "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse",
        "-loop", "0",
        "-ss", "00:00:00",
        "-t", "00:00:05",
        "-preset", "default",
        "-an",
        "-vsync", "0"
      ])
      .toFormat('webp')
      .save(tmpOut);
  });

  const buff = fs.readFileSync(tmpOut);
  fs.unlinkSync(tmpIn);
  fs.unlinkSync(tmpOut);
  return buff;
}

async function writeExifImg(media, metadata) {
  try {
    const wMedia = await imageToWebp(media);
    return await addExif(wMedia, metadata);
  } catch (error) {
    console.error('Error en writeExifImg:', error);
    throw error;
  }
}

async function writeExifVid(media, metadata) {
  try {
    const wMedia = await videoToWebp(media);
    return await addExif(wMedia, metadata);
  } catch (error) {
    console.error('Error en writeExifVid:', error);
    throw error;
  }
}

async function addExif(webpBuffer, metadata) {
  const tmpIn = path.join(tempFolder, randomFileName('webp'));
  const tmpOut = path.join(tempFolder, randomFileName('webp'));
  fs.writeFileSync(tmpIn, webpBuffer);

  const json = {
    "sticker-pack-id": "karbot-sticker",
    "sticker-pack-name": metadata.packname || "",
    "sticker-pack-publisher": metadata.author || "",
    "emojis": metadata.categories || [""]
  };

  const exifAttr = Buffer.from([
    0x49, 0x49, 0x2A, 0x00,
    0x08, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x41, 0x57,
    0x07, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x16, 0x00,
    0x00, 0x00
  ]);
  const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
  const exif = Buffer.concat([exifAttr, jsonBuff]);
  exif.writeUIntLE(jsonBuff.length, 14, 4);

  const img = new webp.Image();
  await img.load(tmpIn);
  img.exif = exif;
  await img.save(tmpOut);
  fs.unlinkSync(tmpIn);
  return tmpOut;
}

function randomFileName(ext) {
  return `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${ext}`;
}

const isUrl = (text) => {
  return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png)/, 'gi'));
};