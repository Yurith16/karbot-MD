import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import fs from 'fs';
import pino from 'pino';
import qrcode from 'qrcode';
import chalk from 'chalk';
import NodeCache from 'node-cache';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(__dirname);

// Importar las mismas librerías que usas en main.js
import { makeWASocket } from '../src/libraries/simple.js';
import store from '../src/libraries/store.js';

// Variable global para almacenar los sub-bots activos
global.subBots = global.subBots || new Map();

let botFunction = async (m, { conn, args, usedPrefix, command, isOwner, text }) => {
    try {
        // Verificación simplificada - permitir a todos los usuarios usar el comando
        let canUseCommand = true;

        const chatJid = m.chat;
        if (global.db?.data?.chats?.[chatJid]?.registered !== undefined) {
            canUseCommand = global.db.data.chats[chatJid].registered;
        }

        if (isOwner) {
            canUseCommand = true;
        }

        if (!canUseCommand) {
            return conn.reply(m.chat, 
                '❌ *ACCESO DENEGADO*\n\n' +
                'Este comando solo está disponible para usuarios registrados.\n' +
                'Contacta al administrador para más información.',
                m
            );
        }

        let sender = m.mentionedJid && m.mentionedJid[0] ? 
            m.mentionedJid[0] : 
            m.fromMe ? conn.user.jid : m.sender;

        let userCode = sender.split('@')[0];

        // Crear directorio para el subbot del usuario
        const userDir = `./jadibts/${userCode}`;
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }

        // Procesar argumentos
        let hasPhoneArg = false;
        if (command === 'getcode' && !args.some(arg => arg?.includes('--phone'))) {
            args.push('--phone');
            hasPhoneArg = true;
        } else {
            hasPhoneArg = args.some(arg => arg?.includes('--phone'));
        }

        if (hasPhoneArg) {
            args = args.map(arg => {
                if (arg && typeof arg === 'string') {
                    return arg.replace(/--phone/g, '').toLowerCase().trim();
                }
                return arg;
            }).filter(arg => arg && arg !== '');
        }

        async function initializeSubBot() {
            try {
                // Importar baileys de la misma manera que en main.js
                const { 
                    DisconnectReason, 
                    useMultiFileAuthState, 
                    fetchLatestBaileysVersion, 
                    makeCacheableSignalKeyStore, 
                    jidNormalizedUser 
                } = await import("baileys");

                // Inicializar estado de autenticación
                const { state, saveState, saveCreds } = await useMultiFileAuthState(userDir);
                const msgRetryCounterCache = new NodeCache();

                const { version } = await fetchLatestBaileysVersion();

                // Configuración idéntica a la de main.js
                const socketConfig = {
                    logger: pino({ level: 'silent' }),
                    printQRInTerminal: false,
                    mobile: false,
                    browser: hasPhoneArg ? ['Chrome', 'Safari', '2.0.0'] : ['Ubuntu', 'Chrome', '110.0.5481.100'],
                    auth: {
                        creds: state.creds,
                        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                    },
                    markOnlineOnConnect: true,
                    generateHighQualityLinkPreview: true,
                    syncFullHistory: false,
                    getMessage: async (key) => {
                        try {
                            let jid = jidNormalizedUser(key.remoteJid);
                            let msg = await store.loadMessage(jid, key.id);
                            return msg?.message || "";
                        } catch (error) {
                            return "";
                        }
                    },
                    msgRetryCounterCache: msgRetryCounterCache,
                    defaultQueryTimeoutMs: 30000,
                    version: version,
                    keepAliveIntervalMs: 30000,
                    maxIdleTimeMs: 45000,
                    connectTimeoutMs: 60000
                };

                let sock = makeWASocket(socketConfig);
                sock.isInit = false;
                sock.uptime = Date.now();

                // Guardar credenciales
                sock.saveCreds = saveCreds;
                sock.saveState = saveState;

                let qrShown = false;
                let reconnectAttempts = 0;
                const maxReconnectAttempts = 5;

                // HANDLER PARA PROCESAR MENSAJES DEL SUB-BOT
                async function handleSubBotMessages(update) {
                    try {
                        const { messages } = update;
                        if (!messages) return;

                        for (let message of messages) {
                            // Ignorar mensajes propios
                            if (message.key.fromMe) continue;

                            const chatId = message.key.remoteJid;
                            const text = message.message?.conversation || 
                                        message.message?.extendedTextMessage?.text || 
                                        message.message?.imageMessage?.caption || '';

                            // Solo responder en chats privados por ahora
                            if (!chatId.endsWith('@s.whatsapp.net')) continue;

                            // Comandos básicos para el sub-bot
                            if (text.startsWith('!')) {
                                const command = text.toLowerCase().slice(1);

                                switch(command) {
                                    case 'menu':
                                    case 'help':
                                    case 'ayuda':
                                        await sock.sendMessage(chatId, {
                                            text: `🤖 *KARBOT-MD - SUB-BOT* 🤖\n\n` +
                                                  `*Comandos disponibles:*\n` +
                                                  `• !menu - Ver este menú\n` +
                                                  `• !ping - Ver estado del bot\n` +
                                                  `• !owner - Información del desarrollador\n` +
                                                  `• !grupos - Grupos oficiales\n\n` +
                                                  `💡 *Este es un sub-bot de KARBOT-MD*\n` +
                                                  `🔧 *Desarrollado por Hernández*`
                                        });
                                        break;

                                    case 'ping':
                                        await sock.sendMessage(chatId, {
                                            text: `🏓 *PONG!*\n\n` +
                                                  `✅ *KARBOT-MD Sub-Bot activo*\n` +
                                                  `⏰ *Uptime:* ${process.uptime().toFixed(0)}s\n` +
                                                  `💻 *Estado:* Conectado\n\n` +
                                                  `🚀 *Powered by KARBOT-MD*`
                                        });
                                        break;

                                    case 'owner':
                                    case 'creador':
                                    case 'developer':
                                        await sock.sendMessage(chatId, {
                                            text: `👑 *INFORMACIÓN DEL CREADOR* 👑\n\n` +
                                                  `*Nombre:* Hernández\n` +
                                                  `*Bot:* KARBOT-MD\n` +
                                                  `*Versión:* Sub-Bot\n\n` +
                                                  `💬 *Contacto:*\n` +
                                                  `https://wa.me/5219999999999\n\n` +
                                                  `🌟 *Gracias por usar KARBOT-MD*`
                                        });
                                        break;

                                    case 'grupos':
                                    case 'groups':
                                        await sock.sendMessage(chatId, {
                                            text: `👥 *GRUPOS OFICIALES KARBOT-MD* 👥\n\n` +
                                                  `*Grupo 1:* [Enlace del grupo]\n` +
                                                  `*Grupo 2:* [Enlace del grupo]\n\n` +
                                                  `📢 *Únete para recibir actualizaciones*`
                                        });
                                        break;

                                    default:
                                        await sock.sendMessage(chatId, {
                                            text: `❌ *COMANDO NO RECONOCIDO*\n\n` +
                                                  `Escribe *!menu* para ver los comandos disponibles.\n\n` +
                                                  `🤖 *KARBOT-MD Sub-Bot*`
                                        });
                                }
                            }

                            // Responder a saludos
                            else if (/^(hola|hello|hi|buenos días|buenas tardes|buenas noches)/i.test(text)) {
                                await sock.sendMessage(chatId, {
                                    text: `👋 ¡Hola! Soy *KARBOT-MD Sub-Bot*\n\n` +
                                          `Escribe *!menu* para ver lo que puedo hacer.\n\n` +
                                          `🚀 *Powered by KARBOT-MD*`
                                });
                            }

                            // Responder a agradecimientos
                            else if (/^(gracias|thanks|thank you|ty)/i.test(text)) {
                                await sock.sendMessage(chatId, {
                                    text: `😊 ¡De nada! ¿En qué más puedo ayudarte?\n\n` +
                                          `Escribe *!menu* para ver mis comandos.\n\n` +
                                          `🌟 *KARBOT-MD*`
                                });
                            }
                        }
                    } catch (error) {
                        console.error('Error en handler de sub-bot:', error);
                    }
                }

                async function handleConnection(update) {
                    const { connection, lastDisconnect, isNewLogin, qr } = update;

                    if (isNewLogin) {
                        sock.isInit = false;
                    }

                    // Mostrar QR code
                    if (qr && !hasPhoneArg && !qrShown) {
                        try {
                            const qrImage = await qrcode.toBuffer(qr, { scale: 6 });
                            await conn.sendMessage(m.chat, {
                                image: qrImage,
                                caption: `🔐 *KARBOT-MD - SUB-BOT - QR CODE* 🔐\n\n` +
                                        `*Escanea este código QR para activar tu Sub-Bot*\n\n` +
                                        `*Pasos para escanear:*\n` +
                                        `1. Abre WhatsApp > Ajustes > Dispositivos vinculados\n` +
                                        `2. Toca en "Vincular un dispositivo"\n` +
                                        `3. Escanea este código QR\n\n` +
                                        `*⚠️ IMPORTANTE:*\n` +
                                        `• El código expira en 60 segundos\n` +
                                        `• Solo funciona con tu número\n` +
                                        `• No compartas este código\n\n` +
                                        `🚀 *Desarrollado por KARBOT-MD*`
                            }, { quoted: m });
                            qrShown = true;
                        } catch (error) {
                            console.error('Error generando QR:', error);
                        }
                    }

                    // Manejar conexión por teléfono
                    if (qr && hasPhoneArg) {
                        try {
                            await conn.sendMessage(m.chat, {
                                text: `📱 *KARBOT-MD - SUB-BOT - PHONE* 📱\n\n` +
                                      `*Modo Teléfono Activado*\n\n` +
                                      `En breve recibirás un código de verificación de 8 dígitos en tu WhatsApp...\n\n` +
                                      `*Instrucciones:*\n` +
                                      `1. Espera el código de 8 dígitos\n` +
                                      `2. El sistema lo procesará automáticamente\n` +
                                      `3. Tu sub-bot se conectará en segundos\n\n` +
                                      `⏳ *Procesando...*\n\n` +
                                      `🚀 *KARBOT-MD*`
                            }, { quoted: m });
                        } catch (error) {
                            console.error('Error enviando mensaje:', error);
                        }
                    }

                    const statusCode = lastDisconnect?.error?.output?.statusCode || 
                                     lastDisconnect?.error?.output?.payload?.statusCode;

                    // Manejar desconexiones
                    if (connection === 'close') {
                        if (statusCode === DisconnectReason.loggedOut) {
                            try {
                                await conn.sendMessage(m.chat, {
                                    text: `❌ *SESIÓN CERRADA*\n\nLa sesión del sub-bot ha sido cerrada. Usa el comando nuevamente para generar una nueva sesión.\n\n🚀 *KARBOT-MD*`
                                }, { quoted: m });
                            } catch (error) {
                                console.error('Error enviando mensaje:', error);
                            }
                            // Limpiar archivos de sesión
                            if (fs.existsSync(userDir)) {
                                fs.rmSync(userDir, { recursive: true, force: true });
                            }
                            // Remover de subBots activos
                            global.subBots.delete(userCode);
                        } else if (statusCode === DisconnectReason.restartRequired) {
                            reconnectAttempts++;
                            if (reconnectAttempts <= maxReconnectAttempts) {
                                try {
                                    await conn.sendMessage(m.chat, {
                                        text: `🔄 *RECONECTANDO* (${reconnectAttempts}/${maxReconnectAttempts})\n\nReconectando automáticamente...\n\n🚀 *KARBOT-MD*`
                                    }, { quoted: m });
                                } catch (error) {
                                    console.error('Error enviando mensaje:', error);
                                }
                                setTimeout(() => initializeSubBot(), 3000);
                            }
                        } else if (statusCode === DisconnectReason.timedOut) {
                            try {
                                await conn.sendMessage(m.chat, {
                                    text: `⏰ *TIEMPO AGOTADO*\n\nLa conexión ha expirado. Usa el comando nuevamente.\n\n🚀 *KARBOT-MD*`
                                }, { quoted: m });
                            } catch (error) {
                                console.error('Error enviando mensaje:', error);
                            }
                        }
                    }

                    // Conexión exitosa
                    if (connection === 'open') {
                        sock.isInit = true;
                        reconnectAttempts = 0;

                        // Guardar el sub-bot en la lista global
                        global.subBots.set(userCode, sock);

                        try {
                            // Mensaje de conexión exitosa
                            await conn.sendMessage(m.chat, {
                                text: `✅ *SUB-BOT CONECTADO*\n\n` +
                                      `*¡Tu sub-bot KARBOT-MD está ahora activo!*\n\n` +
                                      `📊 *Información de conexión:*\n` +
                                      `• Usuario: ${sock.user?.name || 'No disponible'}\n` +
                                      `• Número: ${sock.user?.id?.split(':')[0] || 'No disponible'}\n` +
                                      `• Estado: Conectado ✅\n` +
                                      `• Hora: ${new Date().toLocaleString()}\n\n` +
                                      `💡 *Comandos disponibles:*\n` +
                                      `• !menu - Ver comandos\n` +
                                      `• !ping - Estado del bot\n` +
                                      `• !owner - Información\n\n` +
                                      `🚀 *Powered by KARBOT-MD*`
                            }, { quoted: m });

                            // Si es modo código, enviar las credenciales
                            if (hasPhoneArg) {
                                const credsPath = `${userDir}/creds.json`;
                                if (fs.existsSync(credsPath)) {
                                    const credsData = fs.readFileSync(credsPath, 'utf8');
                                    await conn.sendMessage(m.chat, {
                                        text: `🔐 *CREDENCIALES DE SESIÓN - KARBOT-MD*\n\n` +
                                              `*Guarda estas credenciales para futuras conexiones:*\n\n` +
                                              `\`\`\`${Buffer.from(credsData).toString('base64')}\`\`\`\n\n` +
                                              `*Para reconectar usa:*\n` +
                                              `\`${usedPrefix}${command} ${Buffer.from(credsData).toString('base64')}\`\n\n` +
                                              `🚀 *KARBOT-MD*`
                                    }, { quoted: m });
                                }
                            }
                        } catch (error) {
                            console.error('Error enviando mensaje de conexión:', error);
                        }
                    }
                }

                // Configurar event listeners
                sock.ev.on('connection.update', handleConnection);
                sock.ev.on('creds.update', sock.saveCreds);
                sock.ev.on('messages.upsert', handleSubBotMessages); // ¡ESTO ES LO QUE FALTABA!

                // Configurar reconexión automática
                const reconnectInterval = setInterval(() => {
                    if (!sock.user) {
                        try {
                            if (sock.ws) sock.ws.close();
                        } catch (error) {
                            console.error('Error cerrando conexión:', error);
                        }
                        sock.ev.removeAllListeners();
                        clearInterval(reconnectInterval);
                        global.subBots.delete(userCode);
                    }
                }, 30000);

            } catch (error) {
                console.error('Error inicializando sub-bot:', error);
                try {
                    await conn.sendMessage(m.chat, {
                        text: `❌ *ERROR AL INICIALIZAR*\n\nHa ocurrido un error: ${error.message}\n\nPor favor, intenta nuevamente.\n\n🚀 *KARBOT-MD*`
                    }, { quoted: m });
                } catch (err) {
                    console.error('Error enviando mensaje de error:', err);
                }
            }
        }

        // Si se proporcionaron credenciales, guardarlas
        if (args[0] && args[0].length > 100) {
            try {
                const credsData = Buffer.from(args[0], 'base64').toString('utf8');
                fs.writeFileSync(`${userDir}/creds.json`, credsData);
                await conn.sendMessage(m.chat, {
                    text: `🔐 *CREDENCIALES GUARDADAS*\n\nCredenciales guardadas correctamente. Conectando sub-bot KARBOT-MD...`
                }, { quoted: m });
            } catch (error) {
                await conn.sendMessage(m.chat, {
                    text: `❌ *ERROR CON CREDENCIALES*\n\nLas credenciales proporcionadas no son válidas.\n\n🚀 *KARBOT-MD*`
                }, { quoted: m });
                return;
            }
        }

        // Inicializar el sub-bot
        await initializeSubBot();

    } catch (error) {
        console.error('Error en comando subbot:', error);
        try {
            await conn.reply(m.chat, 
                `❌ *ERROR - KARBOT-MD*\n\nHa ocurrido un error inesperado:\n${error.message}\n\nPor favor, contacta al administrador.`, 
                m
            );
        } catch (err) {
            console.error('Error enviando mensaje de error:', err);
        }
    }
};

// Configuración del comando
botFunction.help = ['jadibot', 'serbot', 'getcode', 'rentbot', 'code'];
botFunction.tags = ['jadibot'];
botFunction.command = /^(jadibot|serbot|getcode|rentbot|code)$/i;
botFunction.private = true;

export default botFunction;