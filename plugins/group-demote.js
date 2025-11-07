const handler = async (m, { conn, usedPrefix }) => {
  let user;

  // Obtener el usuario de diferentes formas
  if (m.quoted) {
    user = m.quoted.sender;
  } else if (m.mentionedJid && m.mentionedJid.length > 0) {
    user = m.mentionedJid[0];
  } else {
    return await conn.sendMessage(
      m.chat,
      {
        text: `*「❌」 Usuario No Especificado*\n\n> ✦ *Debes etiquetar o responder a un usuario*\n> ✦ *Ejemplo:* » ${usedPrefix}quitaradmin @usuario`,
      },
      { quoted: m }
    );
  }

  try {
    // Reacción de proceso
    await conn.sendMessage(m.chat, {
      react: { text: "👤", key: m.key },
    });

    // Quitar admin
    await conn.groupParticipantsUpdate(m.chat, [user], "demote");

    // Reacción de éxito
    await conn.sendMessage(m.chat, {
      react: { text: "✅", key: m.key },
    });

    await conn.sendMessage(
      m.chat,
      {
        text: `*「👤」 Admin Removido*\n\n> ✦ *Usuario:* » @${
          user.split("@")[0]
        }\n> ✦ *Por:* » @${m.sender.split("@")[0]}`,
        mentions: [user, m.sender],
      },
      { quoted: m }
    );
  } catch (error) {
    console.error("Error al quitar admin:", error);

    await conn.sendMessage(m.chat, {
      react: { text: "❌", key: m.key },
    });

    let errorMsg = `*「❌」 Error al Remover Admin*`;

    if (error.message.includes("not an admin")) {
      errorMsg += `\n\n> ✦ *El usuario no es administrador*`;
    } else if (error.message.includes("not in group")) {
      errorMsg += `\n\n> ✦ *El usuario no está en el grupo*`;
    } else {
      errorMsg += `\n\n> ✦ *Error:* » ${error.message}`;
    }

    await conn.sendMessage(
      m.chat,
      {
        text: errorMsg,
      },
      { quoted: m }
    );
  }
};

handler.help = ["demote @usuario"];
handler.tags = ["group"];
handler.command = /^(demote|quitarpoder|quitaradmin|removeradmin|quitaradm)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
