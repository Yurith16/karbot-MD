/* Desarrollado y Creado por: HERNANDEZ - KARBOT-MD */

import translate from '@vitalets/google-translate-api';
import axios from 'axios';
import fetch from 'node-fetch';

const handler = async (m, {conn, text, command, args, usedPrefix}) => {
  if (!text) throw `🤖 *INGRESA UN TEXTO PARA HABLAR CONMIGO*\n*Ejemplo:* ${usedPrefix + command} Hola Karbot`;

  try {
    const resSimi = await simitalk(text);
    conn.sendMessage(m.chat, { text: resSimi.resultado.simsimi }, { quoted: m });
  } catch {
    throw `❌ *ERROR AL CONECTAR CON LA IA*`;
  }
};

handler.help = ['simi', 'bot', 'karbot', 'ia'].map((v) => v + ' <texto>');
handler.tags = ['game'];
handler.command = /^((sim)?simi|bot|alexa|cortana|karbot|ia|inteligencia)$/i;
export default handler;

async function simitalk(ask, apikeyyy = "iJ6FxuA9vxlvz5cKQCt3", language = "es") {
    if (!ask) return { status: false, resultado: { msg: "Debes ingresar un texto para hablar con la IA." }};

    try {
        const response11 = await chatsimsimi(ask, language);
        if (response11.message == 'indefinida' || response11.message == '' || !response11.message) throw new Error("Respuesta indefinida");
        return { status: true, resultado: { simsimi: response11.message }};        
    } catch (error1) {  
        try {
            const response1 = await axios.get(`https://delirius-apiofc.vercel.app/tools/simi?text=${encodeURIComponent(ask)}`);
            const trad1 = await translate(`${response1.data.data.message}`, {to: language, autoCorrect: true});
            if (trad1.text == 'indefinida' || !response1.data) throw new Error("Respuesta indefinida");
            return { status: true, resultado: { simsimi: trad1.text }};        
        } catch {
            try {
                const response2 = await axios.get(`https://api.anbusec.xyz/api/v1/simitalk?apikey=${apikeyyy}&ask=${ask}&lc=${language}`);
                return { status: true, resultado: { simsimi: response2.data.message }};       
            } catch (error2) {
                return { status: false, resultado: { msg: "Todas las API's fallaron. Inténtalo de nuevo más tarde.", error: error2.message }};
            }
        }
    }
}

async function chatsimsimi(ask, language) {
    try {
        const response = await axios.post(
            'https://simi.anbuinfosec.live/api/chat',
            {
                'ask': ask,
                'lc': language
            },
            {
                headers: {
                    'sec-ch-ua-platform': '"Android"',
                    'Referer': 'https://simi.anbuinfosec.live/',
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36',
                    'sec-ch-ua': '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
                    'Content-Type': 'application/json',
                    'sec-ch-ua-mobile': '?1'
                }
            }
        );
        return response.data;
    } catch (error) {
        return { success: false, message: 'Ocurrió un error al conectar con la IA.' };
    }
}