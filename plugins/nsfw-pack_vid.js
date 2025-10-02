import fetch from 'node-fetch';
import fs from 'fs'; // Necesario para fs.readFileSync
import cheerio from 'cheerio'; // Mantenido por si se usa en otros plugins

const handler = async (m, {conn, command, usedPrefix}) => {
    // --- Textos estáticos (sin traducción) ---
    const HORNY_MODE_DISABLED = `⚠️ El modo caliente no está activado en este chat. Actívalo con: *#enable modohorny*`;
    const CAPTION_PACK = `_🥵 Pack 🥵_`;
    const CAPTION_VIDEO = `_🎥 Video XXX generado al azar 🥵_`;

    // Variables para reacciones
    const reactionStart = '⏳';
    const reactionSuccess = '✅';
    const reactionError = '❌';

    // 1. Verificar el modo caliente
    if (!db.data.chats[m.chat].modohorny && m.isGroup) {
        await conn.sendMessage(m.chat, { react: { text: reactionError, key: m.key } });
        throw HORNY_MODE_DISABLED;
    }

    try {
        // Reacción de inicio
        await conn.sendMessage(m.chat, { react: { text: reactionStart, key: m.key } });

        let url = '';
        let mediaType = '';
        let caption = '';

        switch (command) {
            case 'pack':
                url = global.pack[Math.floor(Math.random() * global.pack.length)];
                mediaType = 'image';
                caption = CAPTION_PACK;
                break;
            case 'pack2':
                url = global.packgirl[Math.floor(Math.random() * global.packgirl.length)];
                mediaType = 'image';
                caption = CAPTION_PACK;
                break;
            case 'pack3':
                url = global.packmen[Math.floor(Math.random() * global.packmen.length)];
                mediaType = 'image';
                caption = `_🥵 Pack Hombres 🥵_`; // Caption específico para pack3
                break;
            case 'videoxxx':
            case 'vídeoxxx':
                url = global.videosxxxc[Math.floor(Math.random() * global.videosxxxc.length)];
                mediaType = 'video';
                caption = CAPTION_VIDEO;
                break;
            case 'videoxxxlesbi':
            case 'videolesbixxx':
            case 'pornolesbivid':
            case 'pornolesbianavid':
            case 'pornolesbiv':
            case 'pornolesbianav':
            case 'pornolesv':
                url = global.videosxxxc2[Math.floor(Math.random() * global.videosxxxc2.length)];
                mediaType = 'video';
                caption = CAPTION_VIDEO;
                break;
            default:
                // Esto no debería pasar, pero es una buena práctica
                throw new Error("Comando no reconocido internamente.");
        }

        if (!url) {
            throw new Error("No se pudo obtener una URL de la lista.");
        }

        // Envío del contenido
        if (mediaType === 'image') {
            await conn.sendMessage(m.chat, { image: { url: url }, caption: caption }, { quoted: m });
        } else if (mediaType === 'video') {
            await conn.sendMessage(m.chat, { video: { url: url }, caption: caption }, { quoted: m });
        }

        // Reacción de éxito
        await conn.sendMessage(m.chat, { react: { text: reactionSuccess, key: m.key } });

    } catch (error) {
        console.error("Error al enviar pack/video:", error);
        // Reacción de error
        await conn.sendMessage(m.chat, { react: { text: reactionError, key: m.key } });
        throw `❌ Ocurrió un error al procesar el comando.`;
    }
};

handler.command = /^(pack|pack2|pack3|videoxxx|vídeoxxx|videoxxxlesbi|videolesbixxx|pornolesbivid|pornolesbianavid|pornolesbiv|pornolesbianav|pornolesv)$/i;
export default handler;

// --- MANTENER TUS LISTAS GLOBALES AQUÍ ---
global.pack = [
    // ... tus URLs de pack
'https://telegra.ph/file/957fe4031132ef90b66ec.jpg',
'https://telegra.ph/file/c4b85bd53030cb648382f.jpg',
'https://telegra.ph/file/df56f8a76145df9c923ad.jpg',
'https://telegra.ph/file/d5d1c2c710c4b5ee8bc6c.jpg',
'https://telegra.ph/file/d0c0cd47e87535373ab68.jpg',
'https://telegra.ph/file/651a5a9dc96c97c8ef8fc.jpg',
'https://telegra.ph/file/f857ae461ceab18c38de2.jpg',
'https://telegra.ph/file/5d2a2aeff5e6fbd229eff.jpg',
'https://telegra.ph/file/b93573531f898ea875dd0.jpg',
'https://telegra.ph/file/c798b3959f84d345b0f25.jpg',
'https://telegra.ph/file/de820647f8cabce533557.jpg',
'https://telegra.ph/file/e105097d5fadf3e522eb5.jpg',
'https://telegra.ph/file/8592e352a9ee6c7244737.jpg',
'https://telegra.ph/file/bb9c7d879b7dc1d86a2ce.jpg',
'https://telegra.ph/file/83f108601e6105446ad1f.jpg',
'https://telegra.ph/file/2a6bff14e53ed2533ad25.jpg',
'https://telegra.ph/file/e37d74aeccc5bdfd6be3e.jpg',
'https://telegra.ph/file/ca984650af06b951e961d.jpg',
'https://telegra.ph/file/ebb3ac7f7498dd09f6afc.jpg',
'https://telegra.ph/file/6192305a24ffb8fa30942.jpg',
'https://telegra.ph/file/ee67c17d0043b98dc757e.jpg',
'https://telegra.ph/file/6ae756b686cd2b5950721.jpg',
'https://telegra.ph/file/b1e1da38d897d117c2aa9.jpg',
'https://telegra.ph/file/6b759437dc8b863c2fa19.jpg',
'https://telegra.ph/file/960d8c268aecb5eb117f0.jpg',
'https://telegra.ph/file/d0dd518bdd147cb10b0b5.jpg',
'https://telegra.ph/file/31f2d59b5cd68ec5acb21.jpg',
'https://telegra.ph/file/14ab9bd02f24e0f1a1a03.jpg',
'https://telegra.ph/file/e02bf6bc9227f7f8b7e2a.jpg',
'https://telegra.ph/file/ab55fca1d6b602b1a69df.jpg',
'https://telegra.ph/file/42105cac3666b37da3d1c.jpg',
];
global.packgirl = [
    // ... tus URLs de packgirl
'https://telegra.ph/file/c0da7289bee2d97048feb.jpg',
'https://telegra.ph/file/b8564166f9cac4d843db3.jpg',
'https://telegra.ph/file/fdefd621a17712be15e0e.jpg',
'https://telegra.ph/file/6e1a6dcf1c91bf62d3945.jpg',
'https://telegra.ph/file/0224c1ecf6b676dda3ac0.jpg',
'https://telegra.ph/file/b71b8f04772f1b30355f1.jpg',
'https://telegra.ph/file/6561840400444d2d27d0c.jpg',
'https://telegra.ph/file/37e445df144e1dfcdb744.jpg',
'https://telegra.ph/file/155b6ac6757bdd9cd05f9.jpg',
'https://telegra.ph/file/2255a8a013540c2820a2b.jpg',
'https://telegra.ph/file/450e901ac153765f095c5.jpg',
'https://telegra.ph/file/f18e421a70810015be505.jpg',
'https://telegra.ph/file/d3d190691ec399431434e.jpg',
'https://telegra.ph/file/1fd2b897a1dbc3fdc2a70.jpg',
'https://telegra.ph/file/607d54a909035bca7444f.jpg',
'https://telegra.ph/file/818ba7c0ae82876b190b6.jpg',
'https://telegra.ph/file/0f2bb426951b4a8fe1e5a.jpg',
'https://telegra.ph/file/7e895b5b933226a07558a.jpg',
'https://telegra.ph/file/f9d9f0da337512a1b1882.jpg',
'https://telegra.ph/file/09ff5bfce02f1f78e3861.jpg',
'https://telegra.ph/file/4ad840d401ab1f90444df.jpg',
'https://telegra.ph/file/7b4bdcad3dde870355c94.jpg',
'https://telegra.ph/file/f69a5beaca50fc52a4a71.jpg',
'https://telegra.ph/file/411d7cdee24669e167adb.jpg',
'https://telegra.ph/file/36a63288e27e88e2f8e10.jpg',
'https://telegra.ph/file/1ac7657a5e7b354cd9991.jpg',
'https://telegra.ph/file/14161eab0c1d919dc3218.jpg',
'https://telegra.ph/file/810411b9128fe11dd639a.jpg',
'https://telegra.ph/file/5fe7e98533754b007e7a1.jpg',
];
global.packmen = [
    // ... tus URLs de packmen
'https://telegra.ph/file/bf303b19b9834f90e9617.jpg',
'https://telegra.ph/file/36ef2b807251dfccd17c2.jpg',
'https://telegra.ph/file/bcc34403d16de829ea5d2.jpg',
'https://telegra.ph/file/5c6b7615662fb53a39e53.jpg',
'https://telegra.ph/file/1a8183eff48671ea265c2.jpg',
'https://telegra.ph/file/f9745dcd22f67cbc62e08.jpg',
'https://telegra.ph/file/02219f503317b0596e101.jpg',
'https://telegra.ph/file/470c8ec30400a73d03207.jpg',
'https://telegra.ph/file/c94fa8ed20f2c0cf16786.jpg',
'https://telegra.ph/file/1b02a1ca6a39e741faec7.jpg',
'https://telegra.ph/file/eea58bf7043fd697cdb43.jpg',
'https://telegra.ph/file/ee3db7facdfe73c8df05a.jpg',
'https://telegra.ph/file/d45b4e4af4f2139507f8c.jpg',
'https://telegra.ph/file/d176e7fc8720f98f6b182.jpg',
'https://telegra.ph/file/ce1e072829d1fa5d99f5f.jpg',
'https://telegra.ph/file/a947933701be6d579c958.jpg',
'https://telegra.ph/file/9027e5a464ec88e8ab5c1.jpg',
'https://telegra.ph/file/049a8c611a838ea2f6daa.jpg',
'https://telegra.ph/file/37b35fbc7e2ee73482ee1.jpg',
'https://telegra.ph/file/9bcfade24ae85cd417f06.jpg',
'https://telegra.ph/file/ac0c711585f4300c54355.jpg',
];
global.videosxxxc = [
    // ... tus URLs de videosxxxc
'https://telegra.ph/file/4a270d9945ac46f42d95c.mp4',
'https://telegra.ph/file/958c11e84d271e783ea3f.mp4',
'https://telegra.ph/file/f753759342337c4012b3f.mp4',
'https://telegra.ph/file/379cee56c908dd536dd33.mp4',
'https://telegra.ph/file/411d8f59a5cefc2a1d227.mp4',
'https://telegra.ph/file/ee2cf1b359d6eef50d7b7.mp4',
'https://telegra.ph/file/1e316b25c787f94a0f8fd.mp4',
'https://telegra.ph/file/c229d33edce798cde0ca4.mp4',
'https://telegra.ph/file/b44223e72dd7e80e415f2.mp4',
'https://telegra.ph/file/61486d45a8a3ea95a7c86.mp4',
'https://telegra.ph/file/76ba0dc2a07f491756377.mp4',
'https://telegra.ph/file/831bb88f562bef3f1a15d.mp4',
'https://telegra.ph/file/ee2cf1b359d6eef50d7b7.mp4',
'https://telegra.ph/file/598857924f3a29ffd37ae.mp4',
'https://telegra.ph/file/528caef6ea950ec45aeef.mp4',
'https://telegra.ph/file/4a270d9945ac46f42d95c.mp4',
'https://telegra.ph/file/958c11e84d271e783ea3f.mp4',
'https://telegra.ph/file/f753759342337c4012b3f.mp4',
'https://telegra.ph/file/379cee56c908dd536dd33.mp4',
'https://telegra.ph/file/411d8f59a5cefc2a1d227.mp4',
'https://telegra.ph/file/76ba0dc2a07f491756377.mp4',
'https://telegra.ph/file/831bb88f562bef3f1a15d.mp4',
];

global.videosxxxc2 = [
    // ... tus URLs de videosxxxc2
"https://telegra.ph/file/2dfb1ad0cab22951e30d1.mp4",
"https://telegra.ph/file/c430651857023968d3a76.mp4",
"https://telegra.ph/file/1ba17f6230dd1ea2de48c.mp4",
"https://telegra.ph/file/e04b802f12aafee3d314e.mp4",
"https://telegra.ph/file/a58661697d519d3d0acbd.mp4",
"https://telegra.ph/file/9ed60b18e79fcfebcd76c.mp4",
"https://telegra.ph/file/d58096000ad5eaef0b05e.mp4",
"https://telegra.ph/file/60b4c8ebeadebb7e0da06.mp4"
];