/* Desarrollado y Creado por: HERNANDEZ - KARBOT-MD */
/* Basado en código original de @gata_dios */

let fila, columna, sopaNube, sopaPalabra, sopaDir, userSP, cambioLetra, diamante = null
let intentos = 0

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!userSP) {
        userSP = m.sender.split("@")[0]
        await conn.reply(m.chat, `*@${m.sender.split("@")[0]} INICIANDO JUEGO DE SOPA DE LETRAS...*`, m, { mentions: [m.sender] })
    }

    async function generarSopaDeLetras() {
        const LADO = 16
        let sopaDeLetras = new Array(LADO);

        for (let i = 0; i < LADO; i++) {
            sopaDeLetras[i] = new Array(LADO)
        }

        const PALABRAS = ["KARBOT", "BOT", "WHATSAPP", "JUEGO", "DIVERSION", "PROGRAMACION", "INTELIGENCIA", "ARTIFICIAL", "CODIGO", "DESARROLLO", "HERNANDEZ", "MD", "FUTURO", "TECNOLOGIA", "INNOVACION"]
        const PALABRA = PALABRAS[Math.floor(Math.random() * PALABRAS.length)]

        let filaInicial = Math.floor(Math.random() * LADO)
        let columnaInicial = Math.floor(Math.random() * LADO)
        const DIRECCIONES = ["horizontal", "vertical", "diagonalDerecha", "diagonalIzquierda"]
        const DIRECCION = DIRECCIONES[Math.floor(Math.random() * DIRECCIONES.length)]

        let palabraAgregada = false
        while (!palabraAgregada) {
            filaInicial = Math.floor(Math.random() * LADO)
            columnaInicial = Math.floor(Math.random() * LADO)

            let palabraEntra = true;
            for (let i = 0; i < PALABRA.length; i++) {
                if (DIRECCION === "horizontal" && (columnaInicial + i >= LADO)) {
                    palabraEntra = false
                    break;
                } else if (DIRECCION === "vertical" && (filaInicial + i >= LADO)) {
                    palabraEntra = false
                    break;
                } else if (DIRECCION === "diagonalDerecha" && (filaInicial + i >= LADO || columnaInicial + i >= LADO)) {
                    palabraEntra = false
                    break;
                } else if (DIRECCION === "diagonalIzquierda" && (filaInicial + i >= LADO || columnaInicial - i < 0)) {
                    palabraEntra = false
                    break;
                }
            }

            if (palabraEntra) {
                for (let i = 0; i < PALABRA.length; i++) {
                    if (DIRECCION === "horizontal") {
                        sopaDeLetras[filaInicial][columnaInicial + i] = PALABRA.charAt(i)
                    } else if (DIRECCION === "vertical") {
                        sopaDeLetras[filaInicial + i][columnaInicial] = PALABRA.charAt(i)
                    } else if (DIRECCION === "diagonalDerecha") {
                        sopaDeLetras[filaInicial + i][columnaInicial + i] = PALABRA.charAt(i)
                    } else {
                        sopaDeLetras[filaInicial + i][columnaInicial - i] = PALABRA.charAt(i)
                    }
                }
                palabraAgregada = true;
            }
        }

        const LETRAS_POSIBLES = "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓜⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ"
        const numerosUni = ["⓿", "❶", "❷", "❸", "❹", "❺", "❻", "❼", "❽", "❾", "❿", "⓫", "⓬", "⓭", "⓮", "⓯", "⓰", "⓱", "⓲", "⓳", "⓴"]
        let sopaDeLetrasConBordes = ""
        sopaDeLetrasConBordes += "     " + [...Array(LADO).keys()].map(num => numerosUni[num]).join(" ") + "\n"

        for (let i = 0; i < LADO; i++) {
            let fila = numerosUni[i] + " "

            for (let j = 0; j < LADO; j++) {
                if (sopaDeLetras[i][j]) {
                    fila += sopaDeLetras[i][j] + " "
                } else {
                    let letraAleatoria = LETRAS_POSIBLES.charAt(Math.floor(Math.random() * LETRAS_POSIBLES.length))
                    fila += letraAleatoria + " "
                }
            }
            fila += ""
            sopaDeLetrasConBordes += fila + "\n"
        }

        sopaDeLetrasConBordes = sopaDeLetrasConBordes.replace(/[a-zA-Z]/g, letra => LETRAS_POSIBLES[letra.charCodeAt() - 65] || letra)

        await m.reply(`🔠 *SOPA DE LETRAS - KARBOT-MD* 🔠

🎯 *Encuentra la palabra:* \`\`\`"${PALABRA}"\`\`\`
⏰ *Tienes 3 intentos*

💡 *La palabra comienza con* _"${PALABRA.charAt(0)}"_ *y termina con* _"${PALABRA}"_
🔢 *Intentos restantes:* _${intentos}_

📝 *Para responder usa:*
❇️ \`\`\`${usedPrefix + command} 28\`\`\`
➡️ *Horizontal*    ⬇️ *Vertical*`.trim())

        await m.reply(`🔠 *${PALABRA.split("").join(" ")}* 🔠\n\n` + sopaDeLetrasConBordes.trimEnd())
        fila = filaInicial
        columna = columnaInicial
        sopaNube = sopaDeLetrasConBordes
        sopaPalabra = PALABRA
        sopaDir = DIRECCION.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^./, str => str.toUpperCase())
    }

    cambioLetra = sopaDir
    let tagUser = userSP + '@s.whatsapp.net'
    if (userSP != m.sender.split("@")[0]) {
        await conn.reply(m.chat, `*@${tagUser.split("@")[0]} YA TIENE UN JUEGO ACTIVO*`, m, { mentions: [tagUser] })
        return
    }

    if (intentos === 0) {
        intentos = 3
        generarSopaDeLetras()
        resetUserSP(sopaDir)

        async function resetUserSP() {
            await new Promise((resolve) => setTimeout(resolve, 2 * 60 * 1000))
            if (intentos !== 0) {
                await conn.reply(m.chat, `*@${m.sender.split("@")[0]} ⏰ TIEMPO AGOTADO*`, m, { mentions: [m.sender] })
            }
            await new Promise((resolve) => setTimeout(resolve, 3 * 60 * 1000))
            if (intentos !== 0) {
                await conn.reply(m.chat, `*@${m.sender.split("@")[0]} ⌛ LA PALABRA ERA _"${sopaPalabra}"_ EN DIRECCIÓN _${sopaDir}_ EN FILA _${fila}_ COLUMNA _${columna}_*`, m, { mentions: [m.sender] })
                fila = null, columna = null, sopaNube = null, sopaPalabra = null, sopaDir = null, userSP = null, cambioLetra = null
                intentos = 0
            }
        }
    } else {
        if (`${fila}${columna}` == text) {
            if (sopaPalabra.length <= 4) {
                diamante = 4
            } else if (sopaPalabra.length <= 8) {
                diamante = 8
            } else if (sopaPalabra.length <= 11) {
                diamante = 24
            } else {
                diamante = 32
            }
            global.db.data.users[m.sender].limit += diamante

            await m.reply(`🎉 *¡FELICIDADES! GANASTE ${diamante} 💎 DIAMANTES!!*\n\n🔍 *Encontraste la palabra* _"${sopaPalabra}"_ *en dirección* _${cambioLetra}_ *en fila* _${fila}_ *columna* _${columna}_`)
            fila = null, columna = null, sopaNube = null, sopaPalabra = null, sopaDir = null, userSP = null, cambioLetra = null
            intentos = 0
            return
        } else {
            if (intentos === 1) {
                fila = null, columna = null, sopaNube = null, sopaPalabra = null, sopaDir = null, userSP = null, cambioLetra = null
                intentos = 0
                await m.reply(`❌ *JUEGO TERMINADO*\n💡 *La palabra era* _"${sopaPalabra}"_ *en dirección* _${cambioLetra}_ *en fila* _${fila}_ *columna* _${columna}_`)
                return
            } else {
                intentos -= 1
                await m.reply(`❌ *RESPUESTA INCORRECTA*\n🔄 *Intentos restantes:* _${intentos}_${intentos === 1 ? `\n💡 *Pista:* \`\`\`${sopaPalabra}\`\`\`` : ''}\n\n${intentos === 1 ? `🔍 *Busca la palabra* _${sopaPalabra}_ *en dirección* _"${cambioLetra}"_*\n\n` : ''}${sopaNube}`)
                return
            }
        }
    }
}

handler.command = /^(buscarpalabra|sopa|soup|wordsearch|wordfind|spdeletras|spletras|sppalabras|spalabras|spdepalabras)$/i
export default handler