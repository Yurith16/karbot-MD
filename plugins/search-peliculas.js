import fetch from 'node-fetch';
import axios from 'axios';
import * as cheerio from 'cheerio';

const handler = async (m, {text, usedPrefix, command, conn}) => {
  // Sistema de reacción - indicar procesamiento
  await conn.sendMessage(m.chat, { react: { text: '🎬', key: m.key } });

 try {
  if (!text) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    throw `*[❗] ¿Qué película o serie quieres buscar?*`;
  }

  // Reacción de búsqueda
  await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

  let aaaa;
  let img;
  aaaa = await searchC(text);
  const randomIndex = Math.floor(Math.random() * aaaa.length);

  try {
    img = 'https://wwv.cuevana3.eu' + aaaa[randomIndex].image;
  } catch {
    img = 'https://www.poresto.net/u/fotografias/m/2023/7/5/f1280x720-305066_436741_5050.png';
  }    

  if (aaaa == '') {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    throw `*[❗] No se encontraron resultados.*`;
  }

  // Reacción de éxito
  await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  const res = await aaaa.map((v) => 
    `┌───「🎬 𝙏𝙄𝙏𝙐𝙇𝙊 」─\n` +
    `▸ ${v.title}\n` +
    `└─────────────\n` +
    `┌───「🔗 𝙀𝙉𝙇𝘼𝘾𝙀 」─\n` +
    `▸ ${v.link}\n` +
    `└─────────────`
  ).join`\n\n◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦\n\n`;

  const ads = 
    `╔═══════════════════════╗\n` +
    `║     🎭 𝘼𝘿𝙑𝙀𝙍𝙏𝙀𝙉𝘾𝙄𝘼     ║\n` +
    `╠═══════════════════════╣\n` +
    `║• ¡𝙐𝙨𝙖 𝘼𝙙𝙗𝙡𝙤𝙘𝙠 𝙥𝙖𝙧𝙖 𝙪𝙣𝙖\n` +
    `║  𝙢𝙚𝙟𝙤𝙧 𝙚𝙭𝙥𝙚𝙧𝙞𝙚𝙣𝙘𝙞𝙖!\n` +
    `║• 𝘿𝙚𝙨𝙘𝙖𝙧𝙜𝙖: 𝙗𝙡𝙤𝙘𝙠-𝙩𝙝𝙞𝙨.𝙘𝙤𝙢\n` +
    `╚═══════════════════════╝\n\n` +
    `≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋\n\n`;

  conn.sendMessage(m.chat, {image: {url: img}, caption: ads + res}, {quoted: m});

 } catch {
   await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
   return conn.sendMessage(m.chat, {text: '*[❗] Error, no se obtuvieron resultados.*'}, {quoted: m});   
 }    
};   

handler.command = ['peli', 'pelis', 'peliculas'];
export default handler;

async function searchC(query) {
  const response = await axios.get(`https://wwv.cuevana3.eu/search?q=${query}`);
  const $ = cheerio.load(response.data);
  const resultSearch = [];
  $('.MovieList .TPostMv').each((_, e) => {
    const element = $(e);
    const title = element.find('.TPostMv .Title').first().text();  
    const link = 'https://wwv.cuevana3.eu' + element.find('a').attr('href');
    const image = element.find('img').attr('src');
    resultSearch.push({ title, link, image });
  });
  return resultSearch;
}