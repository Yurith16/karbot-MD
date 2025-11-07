import {tmpdir} from 'os';
import path, {join} from 'path';
import { fileURLToPath } from 'url';
import {
  readdirSync,
  statSync,
  unlinkSync,
  existsSync,
} from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const handler = async (m, {conn}) => {
  const tmp = [
    tmpdir(), 
    join(process.cwd(), 'src/tmp'),
    join(process.cwd(), 'tmp')
  ];

  let deletedFiles = 0;

  try {
    for (const dirname of tmp) {
      if (existsSync(dirname)) {
        const files = readdirSync(dirname);
        for (const file of files) {
          const filePath = join(dirname, file);
          const stats = statSync(filePath);

          if (stats.isFile()) {
            unlinkSync(filePath);
            deletedFiles++;
          }
        }
      }
    }

    await conn.sendMessage(m.chat, {
      text: `*「🧹」 Archivos Temporales*\n\n> ✦ *Archivos eliminados:* » ${deletedFiles}\n> ✦ *Estado:* » Limpieza completada`
    }, { quoted: m });

  } catch (error) {
    console.error('Error en cleartmp:', error);
    await conn.sendMessage(m.chat, {
      text: `*「❌」 Error de Limpieza*\n\n> ✦ *Error:* » ${error.message}`
    }, { quoted: m });
  }
};

handler.help = ['cleartmp'];
handler.tags = ['owner'];
handler.command = /^(cleartmp|cleartemp|limpiartmp|limpiartemporal)$/i;
handler.rowner = true;

export default handler;