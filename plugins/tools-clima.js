import axios from 'axios';

const handler = async (m, {args, usedPrefix, command}) => {
  // Sistema de reacción - indicar procesamiento
  await conn.sendMessage(m.chat, { react: { text: '🌤️', key: m.key } });

  if (!args[0]) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    throw `*🌍 FALTA LA CIUDAD O PAÍS*\n\n_Ejemplo:_\n*${usedPrefix + command} madrid*\n*${usedPrefix + command} buenos aires*\n*${usedPrefix + command} mexico*`;
  }

  try {
    // Reacción de búsqueda
    await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${args}&units=metric&appid=060a6bcfa19809c2cd4d97a212b19273`);
    const res = response.data;

    const name = res.name;
    const Country = res.sys.country;
    const Weather = res.weather[0].description;
    const Temperature = res.main.temp + '°C';
    const Minimum_Temperature = res.main.temp_min + '°C';
    const Maximum_Temperature = res.main.temp_max + '°C';
    const Humidity = res.main.humidity + '%';
    const Wind = res.wind.speed + ' km/h';
    const FeelsLike = res.main.feels_like + '°C';

    // Determinar emoji según el clima
    const weatherEmoji = getWeatherEmoji(res.weather[0].main);

    const weatherInfo = `*${weatherEmoji} CLIMA EN ${name.toUpperCase()}*\n
*📍 Ubicación:* ${name}, ${Country}
*🌤️ Condición:* ${Weather}
*🌡️ Temperatura:* ${Temperature}
*🤔 Sensación térmica:* ${FeelsLike}
*📉 Mínima:* ${Minimum_Temperature}
*📈 Máxima:* ${Maximum_Temperature}
*💧 Humedad:* ${Humidity}
*💨 Viento:* ${Wind}

*Última actualización:* ${new Date().toLocaleString('es-ES')}`;

    // Reacción de éxito
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    await m.reply(weatherInfo);

  } catch (error) {
    // Reacción de error
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

    if (error.response?.status === 404) {
      throw `*❌ CIUDAD NO ENCONTRADA*\n\n_No se encontró información para: ${args.join(' ')}_\n\n*Verifica el nombre e intenta nuevamente*`;
    } else if (error.response?.status === 401) {
      throw `*🔑 ERROR DE API*\n\n_Problema con el servicio del clima_`;
    } else {
      throw `*🌐 ERROR DE CONEXIÓN*\n\n_No se pudo obtener la información del clima_\n\nIntenta más tarde o verifica el nombre de la ciudad`;
    }
  }
};

// Función para obtener emoji según el clima
function getWeatherEmoji(weatherMain) {
  const emojiMap = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Fog': '🌁',
    'Haze': '😶‍🌫️',
    'Dust': '💨',
    'Sand': '🌪️',
    'Ash': '🌋',
    'Squall': '💨',
    'Tornado': '🌪️'
  };
  return emojiMap[weatherMain] || '🌤️';
}

handler.help = ['clima <ciudad/país>'];
handler.tags = ['tools'];
handler.command = /^(clima|tiempo|weather)$/i;
export default handler;