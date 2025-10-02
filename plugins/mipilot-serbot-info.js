import ws from 'ws';

async function handler(m, { conn: _envio, usedPrefix }) {
  const users = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])];

  function convertirMsADiasHorasMinutosSegundos(ms) {
    var segundos = Math.floor(ms / 1000);
    var minutos = Math.floor(segundos / 60);
    var horas = Math.floor(minutos / 60);
    var días = Math.floor(horas / 24);

    segundos %= 60;
    minutos %= 60;
    horas %= 24;

    var resultado = "";
    if (días !== 0) {
      resultado += días + "d ";
    }
    if (horas !== 0) {
      resultado += horas + "h ";
    }
    if (minutos !== 0) {
      resultado += minutos + "m ";
    }
    if (segundos !== 0) {
      resultado += segundos + "s";
    }

    return resultado || "0s";
  }

  const message = users.map((v, index) => 
    `*${index + 1}.-* @${v.user.jid.replace(/[^0-9]/g, '')}\n` +
    `🔗 *Enlace:* wa.me/${v.user.jid.replace(/[^0-9]/g, '')}?text=${usedPrefix}estado\n` +
    `👤 *Usuario:* ${v.user.name || '-'}\n` +
    `⏰ *Uptime:* ${v.uptime ? convertirMsADiasHorasMinutosSegundos(Date.now() - v.uptime) : "Desconocido"}`
  ).join('\n\n');

  const replyMessage = message.length === 0 ? 
    "🤖 *No hay sub-bots activos en este momento*" : 
    message;

  const totalUsers = users.length;

  const responseMessage = `
🤖 *KARBOT-MD - LISTA DE SUB-BOTS* 🤖

*Información de Sub-Bots Activos*

📊 *Estadísticas:*
• Total de Sub-Bots: ${totalUsers || '0'}

${replyMessage.trim()}`.trim();

  // Enviar mensaje con menciones
  await _envio.sendMessage(m.chat, {
    text: responseMessage, 
    mentions: _envio.parseMention(responseMessage)
  }, { quoted: m });

  // Sistema de reacciones
  try {
    // Reacción basada en la cantidad de sub-bots
    let reaction;
    if (totalUsers === 0) {
      reaction = "😴"; // Ningún bot activo
    } else if (totalUsers <= 3) {
      reaction = "👍"; // Pocos bots
    } else if (totalUsers <= 10) {
      reaction = "🔥"; // Varios bots
    } else {
      reaction = "🚀"; // Muchos bots
    }

    // Aplicar reacción al mensaje
    await _envio.sendMessage(m.chat, {
      react: {
        text: reaction,
        key: m.key
      }
    });

    // Reacción adicional basada en el uptime promedio
    if (totalUsers > 0) {
      const uptimes = users.map(v => v.uptime ? Date.now() - v.uptime : 0);
      const avgUptime = uptimes.reduce((a, b) => a + b, 0) / uptimes.length;

      let stabilityReaction;
      if (avgUptime > 24 * 60 * 60 * 1000) { // Más de 1 día
        stabilityReaction = "💎";
      } else if (avgUptime > 6 * 60 * 60 * 1000) { // Más de 6 horas
        stabilityReaction = "⭐";
      } else if (avgUptime > 60 * 60 * 1000) { // Más de 1 hora
        stabilityReaction = "✅";
      } else {
        stabilityReaction = "🆕";
      }

      // Enviar segunda reacción después de un breve delay
      setTimeout(async () => {
        try {
          await _envio.sendMessage(m.chat, {
            react: {
              text: stabilityReaction,
              key: m.key
            }
          });
        } catch (e) {
          console.log('Error enviando segunda reacción:', e);
        }
      }, 1000);
    }

  } catch (reactionError) {
    console.log('Error en sistema de reacciones:', reactionError);
  }
}

handler.command = handler.help = ['listjadibot', 'bots', 'subsbots'];
handler.tags = ['jadibot'];
export default handler;
