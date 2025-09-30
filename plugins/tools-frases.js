import translate from '@vitalets/google-translate-api';
import fetch from 'node-fetch';

const handler = async (m, { conn, command }) => {
  // Sistema de reacciones
  await conn.sendMessage(m.chat, { react: { text: '💫', key: m.key } });

  const consejos = [
    "El verdadero amor no se busca, se construye día a día.",
    "La comunicación es la clave de toda relación duradera.",
    "Amar es encontrar en la felicidad de otro tu propia felicidad.",
    "El amor no es mirarse el uno al otro, sino mirar juntos en la misma dirección.",
    "Las pequeñas cosas son las más importantes en el amor.",
    "Amar es aceptar a alguien con todos sus defectos y virtudes.",
    "El tiempo dedicado al amor nunca es tiempo perdido.",
    "La confianza es el cimiento de todo amor verdadero.",
    "El amor crece cuando se comparten sueños y metas.",
    "Un simple 'te amo' puede cambiar completamente un día.",
    "El respeto es tan importante como el amor en una relación.",
    "Amar es dar sin esperar nada a cambio.",
    "La paciencia es la mejor compañera del amor.",
    "El amor verdadero perdona, pero no olvida aprender.",
    "Los detalles pequeños son los que hacen grande el amor."
  ];

  const frasesromanticas = [
    "Eres mi hoy y todos mis mañanas.",
    "Tu amor es la melodía que calma mi alma.",
    "En un mundo de bits y bytes, tú eres mi variable constante.",
    "Mi corazón compila sin errores cuando pienso en ti.",
    "Eres el código más elegante que he visto en mi vida.",
    "Como un loop infinito, mi amor por ti nunca termina.",
    "Eres la excepción que siempre quiero capturar.",
    "Si el amor tuviera sintaxis, contigo sería perfecto.",
    "Eres mi API favorita, siempre devuelves felicidad.",
    "Mi amor por ti es como JavaScript: está en todas partes.",
    "Eres el firewall que protege mi corazón.",
    "Como un commit perfecto, cada día contigo es una mejora.",
    "Eres más dulce que un comentario bien escrito en el código.",
    "Mi cariño por ti es como un servidor cloud: siempre disponible.",
    "Eres la query que encontró exactamente lo que buscaba en la vida."
  ];

  if (command === 'consejo') {
    await conn.sendMessage(m.chat, { react: { text: '💡', key: m.key } });
    const consejo = consejos[Math.floor(Math.random() * consejos.length)];
    const mensaje = `╭─◆────◈⚘◈─────◆─╮\n\n⠀⠀🌟 *CONSEJO DEL DÍA* 🌟\n\n❥ ${consejo}\n\n╰─◆────◈⚘◈─────◆─╯`;
    await m.reply(mensaje);
  }

  if (command === 'fraseromantica') {
    await conn.sendMessage(m.chat, { react: { text: '💖', key: m.key } });
    const frase_romantica = frasesromanticas[Math.floor(Math.random() * frasesromanticas.length)];
    const mensaje = `╭─◆────◈⚘◈─────◆─╮\n\n⠀⠀💖 *FRASE ROMÁNTICA* 💖\n\n❥ ${frase_romantica}\n\n╰─◆────◈⚘◈─────◆─╯`;
    await m.reply(mensaje);
  }

  if (command == 'historiaromantica') {
    await conn.sendMessage(m.chat, { react: { text: '📖', key: m.key } });
    try {
      const cerpe = await cerpen(`cinta romantis`);
      const storytime = await translate(cerpe.cerita, { to: 'es', autoCorrect: true }).catch((_) => null);
      const titletime = await translate(cerpe.title, { to: 'es', autoCorrect: true }).catch((_) => null);

      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      conn.reply(m.chat, `᭥🫐᭢ *Título:* ${titletime.text}
᭥🍃᭢ *Autor:* ${cerpe.author}
────────────────
${storytime.text}`, m);
    } catch {
      await conn.sendMessage(m.chat, { react: { text: '🤖', key: m.key } });
      const err = await fetch(`https://api.lolhuman.xyz/api/openai?apikey=${lolkeysapi}&text=Elabora%20una%20historia%20romantica%20que%20use%20el%20siguiente%20formato:%20%E1%AD%A5%F0%9F%AB%90%E1%AD%A2%20T%C3%ADtulo:%20%E1%AD%A5%F0%9F%8D%83%E1%AD%A2%20Autor:%20%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%20hsitoria...%20adalah&user=user-unique-id`);
      const json = await err.json();
      const fraseChat = json.result;

      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      conn.reply(m.chat, fraseChat, m);
    }
  }
};

handler.tags = ['tools'];
handler.command = handler.help = ['consejo', 'fraseromantica', 'historiaromantica'];
export default handler;

async function cerpen(category) {
  return new Promise((resolve, reject) => {
    const title = category.toLowerCase().replace(/[()*]/g, '');
    const judul = title.replace(/\s/g, '-');
    const page = Math.floor(Math.random() * 5);
    axios.get('http://cerpenmu.com/category/cerpen-' + judul + '/page/' + page)
      .then((get) => {
        const $ = cheerio.load(get.data);
        const link = [];
        $('article.post').each(function (a, b) {
          link.push($(b).find('a').attr('href'));
        });
        const random = link[Math.floor(Math.random() * link.length)];
        axios.get(random).then((res) => {
          const $$ = cheerio.load(res.data);
          const hasil = {
            title: $$('#content > article > h1').text(),
            author: $$('#content > article').text().split('Cerpen Karangan: ')[1].split('Kategori: ')[0],
            kategori: $$('#content > article').text().split('Kategori: ')[1].split('\n')[0],
            lolos: $$('#content > article').text().split('Lolos moderasi pada: ')[1].split('\n')[0],
            cerita: $$('#content > article > p').text(),
          };
          resolve(hasil);
        });
      });
  });
}