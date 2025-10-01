import { createHash } from 'crypto';

const handler = async function(m, { args }) {
  if (!args[0]) throw '*❌ DEBES INGRESAR TU NÚMERO DE SERIE*\n\nUsa el comando */profile* para ver tu número de serie y luego:\n*/unreg <tu_numero_de_serie>*';

  const user = global.db.data.users[m.sender];
  const sn = createHash('md5').update(m.sender).digest('hex');

  if (args[0] !== sn) throw '*❌ NÚMERO DE SERIE INCORRECTO*\n\nVerifica tu número de serie con */profile* e inténtalo de nuevo.';

  user.registered = false;
  user.name = '';
  user.age = 0;
  user.regTime = 0;

  // Sistema de reacción
  try {
    await this.sendMessage(m.chat, {
      react: {
        text: '🗑️',
        key: m.key
      }
    });
  } catch (reactError) {
    // Ignorar error de reacción
  }

  m.reply(`*✅ REGISTRO ELIMINADO*\n\nTu registro ha sido eliminado exitosamente.\nSi deseas volver a registrarte, usa el comando:\n*/reg nombre.edad*\n\n*🤖 KARBOT-MD | © 2024*`);
};

handler.help = ['unreg <numero de serie>'];
handler.tags = ['xp'];
handler.command = /^unreg(ister)?$/i;
handler.register = true;

export default handler;
