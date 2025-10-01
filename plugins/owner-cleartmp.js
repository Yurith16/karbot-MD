import {tmpdir} from 'os';
import path, {join} from 'path';
import { fileURLToPath } from 'url';
import {
  readdirSync,
  statSync,
  unlinkSync,
  existsSync,
} from 'fs';

// Definir __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const handler = async (m, {conn}) => {
  // Reacción de proceso
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '🧹',
        key: m.key
      }
    });
  } catch (reactError) {}

  await conn.reply(m.chat, '🧹 *LIMPIANDO ARCHIVOS TEMPORALES*\n\nEliminando archivos temporales del sistema...', m);

  const tmp = [
    tmpdir(), 
    join(process.cwd(), 'src/tmp'),
    join(process.cwd(), 'tmp')
  ];

  const filename = [];
  let deletedFiles = 0;
  let errors = 0;

  try {
    for (const dirname of tmp) {
      if (existsSync(dirname)) {
        try {
          const files = readdirSync(dirname);
          for (const file of files) {
            try {
              const filePath = join(dirname, file);
              const stats = statSync(filePath);

              // Solo eliminar archivos, no directorios
              if (stats.isFile()) {
                unlinkSync(filePath);
                deletedFiles++;
                console.log(`✅ Eliminado: ${filePath}`);
              }
            } catch (fileError) {
              errors++;
              console.log(`❌ Error con archivo ${file}:`, fileError.message);
            }
          }
        } catch (dirError) {
          errors++;
          console.log(`❌ Error con directorio ${dirname}:`, dirError.message);
        }
      } else {
        console.log(`📁 Directorio no existe: ${dirname}`);
      }
    }

    // Reacción de éxito
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '✅',
          key: m.key
        }
      });
    } catch (reactError) {}

    let resultMessage = `✅ *LIMPIEZA COMPLETADA*\n\n`;

    if (deletedFiles > 0) {
      resultMessage += `🗑️ *Archivos eliminados:* ${deletedFiles}\n`;
    }

    if (errors > 0) {
      resultMessage += `⚠️ *Errores encontrados:* ${errors}\n`;
    }

    if (deletedFiles === 0 && errors === 0) {
      resultMessage += `📭 No se encontraron archivos temporales para eliminar.`;
    } else {
      resultMessage += `\n💾 Espacio liberado correctamente.`;
    }

    await conn.reply(m.chat, resultMessage, m);

  } catch (mainError) {
    console.error('Error general en cleartmp:', mainError);

    // Reacción de error
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      });
    } catch (reactError) {}

    await conn.reply(m.chat, 
      `❌ *ERROR EN LA LIMPIEZA*\n\nNo se pudo completar la limpieza.\n\nError: ${mainError.message}`, 
      m
    );
  }
};

handler.help = ['cleartmp'];
handler.tags = ['owner'];
handler.command = /^(cleartmp|cleartemp|limpiartmp|limpiartemporal)$/i;
handler.rowner = true;

export default handler;