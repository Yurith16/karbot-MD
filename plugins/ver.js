const handler = async (m, { conn, usedPrefix, command }) => {
  try {
    const quoted = m.quoted ? m.quoted : m;

    if (!quoted) {
      return await conn.reply(m.chat, 
        "❌ Debes responder a una imagen, video o nota de voz para reenviarla.", 
        m
      );
    }

    const unwrap = (message) => {
      let node = message;
      while (
        node?.viewOnceMessage?.message ||
        node?.viewOnceMessageV2?.message ||
        node?.viewOnceMessageV2Extension?.message ||
        node?.ephemeralMessage?.message
      ) {
        node =
          node.viewOnceMessage?.message ||
          node.viewOnceMessageV2?.message ||
          node.viewOnceMessageV2Extension?.message ||
          node.ephemeralMessage?.message;
      }
      return node;
    };

    const inner = unwrap(quoted);

    let mediaType, mediaMsg;
    if (inner.imageMessage) {
      mediaType = "image";
      mediaMsg = inner.imageMessage;
    } else if (inner.videoMessage) {
      mediaType = "video";
      mediaMsg = inner.videoMessage;
    } else if (inner.audioMessage || inner.voiceMessage || inner.pttMessage) {
      mediaType = "audio";
      mediaMsg = inner.audioMessage || inner.voiceMessage || inner.pttMessage;
    } else {
      return await conn.reply(m.chat, 
        "❌ El mensaje citado no contiene un archivo compatible.", 
        m
      );
    }

    await conn.sendMessage(m.chat, {
      react: { text: "⏳", key: m.key }
    });

    const stream = await quoted.download();
    let buffer = Buffer.alloc(0);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    const credit = "> 🔓 Desbloqueado por:\n`Karbot`";
    const opts = { mimetype: mediaMsg.mimetype };

    if (mediaType === "image") {
      opts.image = buffer;
      opts.caption = mediaMsg.caption || credit;
    } else if (mediaType === "video") {
      opts.video = buffer;
      opts.caption = mediaMsg.caption || credit;
    } else {
      opts.audio = buffer;
      opts.ptt = mediaMsg.ptt ?? true;
      if (mediaMsg.seconds) opts.seconds = mediaMsg.seconds;
    }

    await conn.sendMessage(m.chat, opts, { quoted: m });

    if (mediaType === "audio") {
      await conn.reply(m.chat, credit, m);
    }

    await conn.sendMessage(m.chat, {
      react: { text: "✅", key: m.key }
    });

  } catch (err) {
    console.error("❌ Error en comando ver:", err);
    await conn.sendMessage(m.chat, {
      react: { text: "❌", key: m.key }
    });
    await conn.reply(m.chat, 
      "❌ *Error:* Hubo un problema al procesar el archivo.", 
      m
    );
  }
};

handler.help = ['ver'];
handler.tags = ['utilidad'];
handler.command = /^ver$/i;

export default handler;