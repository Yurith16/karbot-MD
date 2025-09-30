import fs from "fs"
import axios from "axios"
import uploadImage from "../src/libraries/uploadImage.js"

const handler = async (m, { conn, usedPrefix, command }) => {
  try {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || q.mediaType || ""

    if (!mime) throw `*🚫 Responde a una imagen o envíala con el comando ${usedPrefix + command}*`
    if (!/image\/(jpe?g|png)/.test(mime)) throw `*🚫 Formato no soportado (${mime}). Solo se permiten imágenes JPEG o PNG*`

    m.reply(`*🔄 Mejorando calidad de la imagen...*`)

    const img = await q.download()
    const fileUrl = await uploadImage(img)
    const banner = await upscaleWithStellar(fileUrl)

    await conn.sendMessage(m.chat, { image: banner }, { quoted: m })
  } catch (e) {
    throw `*❌ Error al mejorar la imagen:* ` + e
  }
}

handler.help = ["remini", "hd", "enhance"]
handler.tags = ["ai", "tools"]
handler.command = ["remini", "hd", "enhance"]
export default handler

async function upscaleWithStellar(url) {
  const endpoint = `https://api.stellarwa.xyz/tools/upscale?url=${url}&apikey=TheMystic`

  const { data } = await axios.get(endpoint, {
    responseType: "arraybuffer",
    headers: {
      accept: "image/*"
    }
  })

  return Buffer.from(data)
}