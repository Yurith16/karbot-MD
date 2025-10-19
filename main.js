process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
import './config.js';
import './api.js';
import { createRequire } from 'module';
import path, { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { platform } from 'process';
import fs, { readdirSync, statSync, unlinkSync, existsSync, readFileSync, watch } from 'fs';
import yargs from 'yargs';
import { spawn } from 'child_process';
import lodash from 'lodash';
import chalk from 'chalk';
import syntaxerror from 'syntax-error';
import { format } from 'util';
import pino from 'pino';
import Pino from 'pino';
import { Boom } from '@hapi/boom';
import { makeWASocket, protoType, serialize } from './src/libraries/simple.js';
import { initializeSubBots } from './src/libraries/subBotManager.js';
import { Low, JSONFile } from 'lowdb';
import store from './src/libraries/store.js';
import LidResolver from './src/libraries/LidResolver.js';

const { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser, PHONENUMBER_MCC } = await import("baileys");
import readline from 'readline';
import NodeCache from 'node-cache';
const { chain } = lodash;
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;
let stopped = 'close';
protoType();
serialize();
const msgRetryCounterMap = new Map();
const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
}; global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL, true));
}; global.__require = function require(dir = import.meta.url) {
  return createRequire(dir);
};
global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}) })) : '');
global.timestamp = { start: new Date };
global.videoList = [];
global.videoListXXX = [];
const __dirname = global.__dirname(import.meta.url);
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = new RegExp('^[#!/.]')
global.db = new Low(/https?:\/\//.test(opts['db'] || '') ? new cloudDBAdapter(opts['db']) : new JSONFile(`${opts._[0] ? opts._[0] + '_' : ''}database.json`));

global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) {
    return new Promise((resolve) => setInterval(async function () {
      if (!global.db.READ) {
        clearInterval(this);
        resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
      }
    }, 1 * 1000));
  }
  if (global.db.data !== null) return;
  global.db.READ = true;
  await global.db.read().catch(console.error);
  global.db.READ = null;
  global.db.data = {
    users: {},
    chats: {},
    stats: {},
    msgs: {},
    sticker: {},
    settings: {},
    ...(global.db.data || {}),
  };
  global.db.chain = chain(global.db.data);
};
loadDatabase();

/* ------------------------------------------------*/

class LidDataManager {
  constructor(cacheFile = './src/lidsresolve.json') {
    this.cacheFile = cacheFile;
  }

  loadData() {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const data = fs.readFileSync(this.cacheFile, 'utf8');
        return JSON.parse(data);
      }
      return {};
    } catch (error) {
      console.error('𝙀𝙧𝙧𝙤𝙧 𝙘𝙖𝙧𝙜𝙖𝙣𝙙𝙤 𝙘𝙖𝙘𝙝𝙚 𝙇𝙄𝘿:', error.message);
      return {};
    }
  }

  getUserInfo(lidNumber) {
    const data = this.loadData();
    return data[lidNumber] || null;
  }

  getUserInfoByJid(jid) {
    const data = this.loadData();
    for (const [key, entry] of Object.entries(data)) {
      if (entry && entry.jid === jid) {
        return entry;
      }
    }
    return null;
  }

  findLidByJid(jid) {
    const data = this.loadData();
    for (const [key, entry] of Object.entries(data)) {
      if (entry && entry.jid === jid) {
        return entry.lid;
      }
    }
    return null;
  }

  getAllUsers() {
    const data = this.loadData();
    const users = [];

    for (const [key, entry] of Object.entries(data)) {
      if (entry && !entry.notFound && !entry.error) {
        users.push({
          lid: entry.lid,
          jid: entry.jid,
          name: entry.name,
          country: entry.country,
          phoneNumber: entry.phoneNumber,
          isPhoneDetected: entry.phoneDetected || entry.corrected,
          timestamp: new Date(entry.timestamp).toLocaleString()
        });
      }
    }

    return users.sort((a, b) => a.name.localeCompare(b.name));
  }

  getStats() {
    const data = this.loadData();
    let valid = 0, notFound = 0, errors = 0, phoneNumbers = 0, corrected = 0;

    for (const [key, entry] of Object.entries(data)) {
      if (entry) {
        if (entry.phoneDetected || entry.corrected) phoneNumbers++;
        if (entry.corrected) corrected++;
        if (entry.notFound) notFound++;
        else if (entry.error) errors++;
        else valid++;
      }
    }

    return {
      total: Object.keys(data).length,
      valid,
      notFound,
      errors,
      phoneNumbers,
      corrected,
      cacheFile: this.cacheFile,
      fileExists: fs.existsSync(this.cacheFile)
    };
  }

  getUsersByCountry() {
    const data = this.loadData();
    const countries = {};

    for (const [key, entry] of Object.entries(data)) {
      if (entry && !entry.notFound && !entry.error && entry.country) {
        if (!countries[entry.country]) {
          countries[entry.country] = [];
        }

        countries[entry.country].push({
          lid: entry.lid,
          jid: entry.jid,
          name: entry.name,
          phoneNumber: entry.phoneNumber
        });
      }
    }

    for (const country of Object.keys(countries)) {
      countries[country].sort((a, b) => a.name.localeCompare(b.name));
    }

    return countries;
  }
}

const lidDataManager = new LidDataManager();

async function processTextMentions(text, groupId, lidResolver) {
  if (!text || !groupId || !text.includes('@')) return text;

  try {
    const mentionRegex = /@(\d{8,20})/g;
    const mentions = [...text.matchAll(mentionRegex)];

    if (!mentions.length) return text;

    let processedText = text;
    const processedMentions = new Set();
    const replacements = new Map();

    for (const mention of mentions) {
      const [fullMatch, lidNumber] = mention;

      if (processedMentions.has(lidNumber)) continue;
      processedMentions.add(lidNumber);

      const lidJid = `${lidNumber}@lid`;

      try {
        const resolvedJid = await lidResolver.resolveLid(lidJid, groupId);

        if (resolvedJid && resolvedJid !== lidJid && !resolvedJid.endsWith('@lid')) {
          const resolvedNumber = resolvedJid.split('@')[0];

          if (resolvedNumber && resolvedNumber !== lidNumber) {
            replacements.set(lidNumber, resolvedNumber);
          }
        }
      } catch (error) {
        console.error(`𝙀𝙧𝙧𝙤𝙧 𝙥𝙧𝙤𝙘𝙚𝙨𝙖𝙣𝙙𝙤 𝙢𝙚𝙣𝙘𝙞ó𝙣 𝙇𝙄𝘿 ${lidNumber}:`, error.message);
      }
    }

    for (const [lidNumber, resolvedNumber] of replacements.entries()) {
      const globalRegex = new RegExp(`@${lidNumber}\\b`, 'g');
      processedText = processedText.replace(globalRegex, `@${resolvedNumber}`);
    }

    return processedText;
  } catch (error) {
    console.error('𝙀𝙧𝙧𝙤𝙧 𝙚𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙖𝙧 𝙢𝙚𝙣𝙘𝙞𝙤𝙣𝙚𝙨:', error);
    return text;
  }
}

async function processMessageContent(messageContent, groupChatId, lidResolver) {
  if (!messageContent || typeof messageContent !== 'object') return;

  const messageTypes = Object.keys(messageContent);

  for (const msgType of messageTypes) {
    const msgContent = messageContent[msgType];
    if (!msgContent || typeof msgContent !== 'object') continue;

    if (typeof msgContent.text === 'string') {
      try {
        const originalText = msgContent.text;
        msgContent.text = await processTextMentions(originalText, groupChatId, lidResolver);
      } catch (error) {
        console.error('𝙀𝙧𝙧𝙤𝙧 𝙥𝙧𝙤𝙘𝙚𝙨𝙖𝙣𝙙𝙤 𝙩𝙚𝙭𝙩𝙤:', error);
      }
    }

    if (typeof msgContent.caption === 'string') {
      try {
        const originalCaption = msgContent.caption;
        msgContent.caption = await processTextMentions(originalCaption, groupChatId, lidResolver);
      } catch (error) {
        console.error('𝙀𝙧𝙧𝙤𝙧 𝙥𝙧𝙤𝙘𝙚𝙨𝙖𝙣𝙙𝙤 𝙘𝙖𝙥𝙩𝙞𝙤𝙣:', error);
      }
    }

    if (msgContent.contextInfo) {
      await processContextInfo(msgContent.contextInfo, groupChatId, lidResolver);
    }
  }
}

async function processContextInfo(contextInfo, groupChatId, lidResolver) {
  if (!contextInfo || typeof contextInfo !== 'object') return;

  if (contextInfo.mentionedJid && Array.isArray(contextInfo.mentionedJid)) {
    const resolvedMentions = [];
    for (const jid of contextInfo.mentionedJid) {
      if (typeof jid === 'string' && jid.endsWith?.('@lid')) {
        try {
          const resolved = await lidResolver.resolveLid(jid, groupChatId);
          resolvedMentions.push(resolved && !resolved.endsWith('@lid') ? resolved : jid);
        } catch (error) {
          resolvedMentions.push(jid);
        }
      } else {
        resolvedMentions.push(jid);
      }
    }
    contextInfo.mentionedJid = resolvedMentions;
  }

  if (typeof contextInfo.participant === 'string' && contextInfo.participant.endsWith?.('@lid')) {
    try {
      const resolved = await lidResolver.resolveLid(contextInfo.participant, groupChatId);
      if (resolved && !resolved.endsWith('@lid')) {
        contextInfo.participant = resolved;
      }
    } catch (error) {
      console.error('𝙀𝙧𝙧𝙤𝙧 𝙧𝙚𝙨𝙤𝙡𝙫𝙞𝙚𝙣𝙙𝙤 𝙥𝙖𝙧𝙩𝙞𝙘𝙞𝙥𝙖𝙣𝙩:', error);
    }
  }

  if (contextInfo.quotedMessage) {
    await processMessageContent(contextInfo.quotedMessage, groupChatId, lidResolver);
  }

  if (typeof contextInfo.stanzaId === 'string') {
    contextInfo.stanzaId = await processTextMentions(contextInfo.stanzaId, groupChatId, lidResolver);
  }
}

async function processMessageForDisplay(message, lidResolver) {
  if (!message || !lidResolver) return message;

  try {
    const processedMessage = JSON.parse(JSON.stringify(message));
    const groupChatId = message.key?.remoteJid?.endsWith?.('@g.us') ? message.key.remoteJid : null;

    if (!groupChatId) return processedMessage;

    if (processedMessage.key?.participant?.endsWith?.('@lid')) {
      try {
        const resolved = await lidResolver.resolveLid(processedMessage.key.participant, groupChatId);
        if (resolved && resolved !== processedMessage.key.participant && !resolved.endsWith('@lid')) {
          processedMessage.key.participant = resolved;
        }
      } catch (error) {
        console.error('𝙀𝙧𝙧𝙤𝙧 𝙧𝙚𝙨𝙤𝙡𝙫𝙞𝙚𝙣𝙙𝙤 𝙥𝙖𝙧𝙩𝙞𝙘𝙞𝙥𝙖𝙣𝙩:', error);
      }
    }

    if (processedMessage.mentionedJid && Array.isArray(processedMessage.mentionedJid)) {
      const resolvedMentions = [];
      for (const jid of processedMessage.mentionedJid) {
        if (typeof jid === 'string' && jid.endsWith?.('@lid')) {
          try {
            const resolved = await lidResolver.resolveLid(jid, groupChatId);
            resolvedMentions.push(resolved && !resolved.endsWith('@lid') ? resolved : jid);
          } catch (error) {
            resolvedMentions.push(jid);
          }
        } else {
          resolvedMentions.push(jid);
        }
      }
      processedMessage.mentionedJid = resolvedMentions;
    }

    if (processedMessage.message) {
      await processMessageContent(processedMessage.message, groupChatId, lidResolver);
    }

    return processedMessage;
  } catch (error) {
    console.error('𝙀𝙧𝙧𝙤𝙧 𝙥𝙧𝙤𝙘𝙚𝙨𝙖𝙣𝙙𝙤 𝙢𝙚𝙣𝙨𝙖𝙟𝙚:', error);
    return message;
  }
}

function extractAllText(message) {
  if (!message?.message) return '';

  let allText = '';

  const extractFromContent = (content) => {
    if (!content) return '';
    let text = '';

    if (content.text) text += content.text + ' ';
    if (content.caption) text += content.caption + ' ';

    if (content.contextInfo?.quotedMessage) {
      const quotedTypes = Object.keys(content.contextInfo.quotedMessage);
      for (const quotedType of quotedTypes) {
        const quotedContent = content.contextInfo.quotedMessage[quotedType];
        text += extractFromContent(quotedContent);
      }
    }

    return text;
  };

  const messageTypes = Object.keys(message.message);
  for (const msgType of messageTypes) {
    allText += extractFromContent(message.message[msgType]);
  }

  return allText.trim();
}

async function interceptMessages(messages, lidResolver) {
  if (!Array.isArray(messages)) return messages;

  const processedMessages = [];

  for (const message of messages) {
    try {
      let processedMessage = message;

      if (lidResolver && typeof lidResolver.processMessage === 'function') {
        try {
          processedMessage = await lidResolver.processMessage(message);
        } catch (error) {
          console.error('𝙀𝙧𝙧𝙤𝙧 𝙚𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙖𝙧 𝙢𝙚𝙣𝙨𝙖𝙟𝙚:', error);
        }
      }

      processedMessage = await processMessageForDisplay(processedMessage, lidResolver);

      processedMessages.push(processedMessage);
    } catch (error) {
      console.error('𝙀𝙧𝙧𝙤𝙧 𝙞𝙣𝙩𝙚𝙧𝙘𝙚𝙥𝙩𝙖𝙣𝙙𝙤 𝙢𝙚𝙣𝙨𝙖𝙟𝙚:', error);
      processedMessages.push(message);
    }
  }

  return processedMessages;
}

const { state, saveCreds } = await useMultiFileAuthState(global.authFile);
const version22 = await fetchLatestBaileysVersion();
console.log(version22)
const version = [2, 3000, 1025190524]; 
let phoneNumber = global.botnumber || process.argv.find(arg => arg.startsWith('--phone='))?.split('=')[1];
const methodCodeQR = process.argv.includes('--method=qr');
const methodCode = !!phoneNumber || process.argv.includes('--method=code');
const MethodMobile = process.argv.includes("mobile");
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver));

let opcion;
if (methodCodeQR) opcion = '1';
if (!methodCodeQR && !methodCode && !fs.existsSync(`./${global.authFile}/creds.json`)) {
  do {
    opcion = await question('[ ℹ️ ] 𝙎𝙚𝙡𝙚𝙘𝙘𝙞𝙤𝙣𝙖 𝙪𝙣𝙖 𝙤𝙥𝙘𝙞ó𝙣:\n1. 𝘾𝙤𝙣 𝙘ó𝙙𝙞𝙜𝙤 𝙌𝙍\n2. 𝘾𝙤𝙣 𝙘ó𝙙𝙞𝙜𝙤 𝙙𝙚 𝙩𝙚𝙭𝙩𝙤\n---> ');
    if (!/^[1-2]$/.test(opcion)) {
      console.log('[ ⚠️ ] 𝙎𝙚𝙡𝙚𝙘𝙘𝙞𝙤𝙣𝙖 𝙨𝙤𝙡𝙤 1 𝙤 2.\n');
    }
  } while (opcion !== '1' && opcion !== '2' || fs.existsSync(`./${global.authFile}/creds.json`));
}

const filterStrings = [
  "Q2xvc2luZyBzdGFsZSBvcGVu",
  "Q2xvc2luZyBvcGVuIHNlc3Npb24=",
  "RmFpbGVkIHRvIGRlY3J5cHQ=",
  "U2Vzc2lvbiBlcnJvcg==",
  "RXJyb3I6IEJhZCBNQUM=",
  "RGVjcnlwdGVkIG1lc3NhZ2U="
];

console.info = () => { };
console.debug = () => { };
['log', 'warn', 'error'].forEach(methodName => {
  const originalMethod = console[methodName];
  console[methodName] = function () {
    const message = arguments[0];
    if (typeof message === 'string' && filterStrings.some(filterString => message.includes(Buffer.from(filterString, 'base64').toString()))) {
      arguments[0] = "";
    }
    originalMethod.apply(console, arguments);
  };
});

process.on('uncaughtException', (err) => {
  if (filterStrings.includes(Buffer.from(err.message).toString('base64'))) return;
  console.error('𝙐𝙣𝙘𝙖𝙪𝙜𝙝𝙩 𝙀𝙭𝙘𝙚𝙥𝙩𝙞𝙤𝙣:', err);
});

const connectionOptions = {
  logger: pino({ level: 'silent' }),
  printQRInTerminal: opcion == '1' ? true : methodCodeQR ? true : false,
  mobile: MethodMobile,
  browser: opcion === '1' ? ['KARBOT-MD', 'Safari', '2.0.0'] : methodCodeQR ? ['KARBOT-MD', 'Safari', '2.0.0'] : ['Ubuntu', 'Chrome', '20.0.04'],
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "fatal" }).child({ level: "fatal" })),
  },
  markOnlineOnConnect: false,
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
  msgRetryCounterCache: msgRetryCounterCache || new Map(),
  userDevicesCache: userDevicesCache || new Map(),
  defaultQueryTimeoutMs: undefined,
  cachedGroupMetadata: (jid) => global.conn.chats[jid] ?? {},
  keepAliveIntervalMs: 55000,
  maxIdleTimeMs: 60000,
  version,
};

global.conn = makeWASocket(connectionOptions);
const lidResolver = new LidResolver(global.conn);

setTimeout(async () => {
  try {
    if (lidResolver) {
      lidResolver.autoCorrectPhoneNumbers();
    }
  } catch (error) {
    console.error('𝙀𝙧𝙧𝙤𝙧 𝙚𝙣 𝙖𝙣á𝙡𝙞𝙨𝙞𝙨 𝙞𝙣𝙞𝙘𝙞𝙖𝙡:', error.message);
  }
}, 5000);

if (!fs.existsSync(`./${global.authFile}/creds.json`)) {
  if (opcion === '2' || methodCode) {
    opcion = '2';
    if (!conn.authState.creds.registered) {
      if (MethodMobile) throw new Error('𝙉𝙤 𝙨𝙚 𝙥𝙪𝙚𝙙𝙚 𝙪𝙨𝙖𝙧 𝙘ó𝙙𝙞𝙜𝙤 𝙙𝙚 𝙚𝙢𝙥𝙖𝙧𝙚𝙟𝙖𝙢𝙞𝙚𝙣𝙩𝙤 𝙘𝙤𝙣 𝙡𝙖 𝘼𝙋𝙄 𝙢ó𝙫𝙞𝙡');

      let numeroTelefono;
      if (!!phoneNumber) {
        numeroTelefono = phoneNumber.replace(/[^0-9]/g, '');
        if (!Object.keys(PHONENUMBER_MCC).some(v => numeroTelefono.startsWith(v))) {
          console.log(chalk.bgBlack(chalk.bold.redBright("𝙄𝙣𝙜𝙧𝙚𝙨𝙖 𝙚𝙡 𝙘ó𝙙𝙞𝙜𝙤 𝙙𝙚 𝙥𝙖í𝙨 𝙙𝙚 𝙩𝙪 𝙣ú𝙢𝙚𝙧𝙤.\n𝙀𝙟𝙚𝙢𝙥𝙡𝙤: +5219992095479\n")));
          process.exit(0);
        }
      } else {
        while (true) {
          numeroTelefono = await question(chalk.bgBlack(chalk.bold.yellowBright('𝙀𝙨𝙘𝙧𝙞𝙗𝙚 𝙩𝙪 𝙣ú𝙢𝙚𝙧𝙤 𝙙𝙚 𝙒𝙝𝙖𝙩𝙨𝘼𝙥𝙥.\n𝙀𝙟𝙚𝙢𝙥𝙡𝙤: +5219992095479\n')));
          numeroTelefono = numeroTelefono.replace(/[^0-9]/g, '');
          if (numeroTelefono.match(/^\d+$/) && Object.keys(PHONENUMBER_MCC).some(v => numeroTelefono.startsWith(v))) break;
          console.log(chalk.bgBlack(chalk.bold.redBright("𝙀𝙨𝙘𝙧𝙞𝙗𝙚 𝙩𝙪 𝙣ú𝙢𝙚𝙧𝙤 𝙙𝙚 𝙒𝙝𝙖𝙩𝙨𝘼𝙥𝙥.\n𝙀𝙟𝙚𝙢𝙥𝙡𝙤: +5219992095479.\n")));
        }
        rl.close();
      }

      setTimeout(async () => {
        let codigo = await conn.requestPairingCode(numeroTelefono);
        codigo = codigo?.match(/.{1,4}/g)?.join("-") || codigo;
        console.log(chalk.yellow('[ ℹ️ ] 𝙄𝙣𝙩𝙧𝙤𝙙𝙪𝙘𝙚 𝙚𝙡 𝙘ó𝙙𝙞𝙜𝙤 𝙙𝙚 𝙚𝙢𝙥𝙖𝙧𝙚𝙟𝙖𝙢𝙞𝙚𝙣𝙩𝙤 𝙚𝙣 𝙒𝙝𝙖𝙩𝙨𝘼𝙥𝙥.'));
        console.log(chalk.black(chalk.bgGreen(`𝙏𝙪 𝙘ó𝙙𝙞𝙜𝙤: `)), chalk.black(chalk.white(codigo)));
      }, 3000);
    }
  }
}

conn.isInit = false;
conn.well = false;
conn.logger.info(`[ ℹ️ ] 𝘾𝙖𝙧𝙜𝙖𝙣𝙙𝙤...\n`);

if (!opts['test']) {
  if (global.db) {
    setInterval(async () => {
      if (global.db.data) await global.db.write();
      if (opts['autocleartmp'] && (global.support || {}).find) {
        const tmp = [os.tmpdir(), 'tmp', 'jadibts'];
        tmp.forEach((filename) => cp.spawn('find', [filename, '-amin', '3', '-type', 'f', '-delete']));
      }
    }, 30 * 1000);
  }
}

if (opts['server']) (await import('./server.js')).default(global.conn, PORT);

function clearTmp() {
  const tmp = [join(__dirname, './src/tmp')];
  const filename = [];
  tmp.forEach((dirname) => readdirSync(dirname).forEach((file) => filename.push(join(dirname, file))));
  return filename.map((file) => {
    const stats = statSync(file);
    if (stats.isFile() && (Date.now() - stats.mtimeMs >= 1000 * 60 * 3)) return unlinkSync(file);
    return false;
  });
}

const dirToWatchccc = path.join(__dirname, './');
function deleteCoreFiles(filePath) {
  const coreFilePattern = /^core\.\d+$/i;
  const filename = path.basename(filePath);
  if (coreFilePattern.test(filename)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error(`𝙀𝙧𝙧𝙤𝙧 𝙚𝙡𝙞𝙢𝙞𝙣𝙖𝙣𝙙𝙤 𝙖𝙧𝙘𝙝𝙞𝙫𝙤 ${filePath}:`, err);
    });
  }
}
fs.watch(dirToWatchccc, (eventType, filename) => {
  if (eventType === 'rename') {
    const filePath = path.join(dirToWatchccc, filename);
    fs.stat(filePath, (err, stats) => {
      if (!err && stats.isFile()) deleteCoreFiles(filePath);
    });
  }
});

function purgeSession() {
  let prekey = [];
  let directorio = readdirSync("./MysticSession");
  let filesFolderPreKeys = directorio.filter(file => file.startsWith('pre-key-'));
  prekey = [...prekey, ...filesFolderPreKeys];
  filesFolderPreKeys.forEach(files => unlinkSync(`./MysticSession/${files}`));
}

function purgeSessionSB() {
  try {
    let listaDirectorios = readdirSync('./jadibts/');
    let SBprekey = [];
    listaDirectorios.forEach(directorio => {
      if (statSync(`./jadibts/${directorio}`).isDirectory()) {
        let DSBPreKeys = readdirSync(`./jadibts/${directorio}`).filter(fileInDir => fileInDir.startsWith('pre-key-'));
        SBprekey = [...SBprekey, ...DSBPreKeys];
        DSBPreKeys.forEach(fileInDir => unlinkSync(`./jadibts/${directorio}/${fileInDir}`));
      }
    });
  } catch (err) {
    console.log(chalk.bold.red(`[ ℹ️ ] 𝘼𝙡𝙜𝙤 𝙨𝙖𝙡𝙞ó 𝙢𝙖𝙡 𝙚𝙣 𝙡𝙖 𝙚𝙡𝙞𝙢𝙞𝙣𝙖𝙘𝙞ó𝙣`));
  }
}

function purgeOldFiles() {
  const directories = ['./MysticSession/', './jadibts/'];
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  directories.forEach(dir => {
    readdirSync(dir, (err, files) => {
      if (err) throw err;
      files.forEach(file => {
        const filePath = path.join(dir, file);
        stat(filePath, (err, stats) => {
          if (err) throw err;
          if (stats.isFile() && stats.mtimeMs < oneHourAgo && file !== 'creds.json') {
            unlinkSync(filePath, err => {
              if (err) throw err;
            });
          }
        });
      });
    });
  });
}

async function connectionUpdate(update) {
  let isFirstConnection = '';
  let qrAlreadyShown = false;
  let qrTimeout = null;
  const { connection, lastDisconnect, isNewLogin } = update;
  stopped = connection;
  if (isNewLogin) conn.isInit = true;
  const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
  if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
    await global.reloadHandler(true).catch(console.error);
    global.timestamp.connect = new Date;
  }
  if (global.db.data == null) loadDatabase();
  if (update.qr != 0 && update.qr != undefined || methodCodeQR) {
    if (opcion == '1' || methodCodeQR) {
      console.log(chalk.yellow('[ ℹ️ ] 𝙀𝙨𝙘𝙖𝙣𝙚𝙖 𝙚𝙡 𝙘ó𝙙𝙞𝙜𝙤 𝙌𝙍.'));
      qrAlreadyShown = true;
      if (qrTimeout) clearTimeout(qrTimeout);
      qrTimeout = setTimeout(() => qrAlreadyShown = false, 60000);
    }
  }
  if (connection == 'open') {
    console.log(chalk.yellow('[ ℹ️ ] 𝘾𝙤𝙣𝙚𝙘𝙩𝙖𝙙𝙤 𝙘𝙤𝙧𝙧𝙚𝙘𝙩𝙖𝙢𝙚𝙣𝙩𝙚.'));
    isFirstConnection = true;
    if (!global.subBotsInitialized) {
      global.subBotsInitialized = true;
      try {
        await initializeSubBots();
      } catch (error) {
        console.error(chalk.red('[ ⚠️ ] 𝙀𝙧𝙧𝙤𝙧 𝙖𝙡 𝙞𝙣𝙞𝙘𝙞𝙖𝙡𝙞𝙯𝙖𝙧 𝙨𝙪𝙗-𝙗𝙤𝙩𝙨:'), error);
      }
    }
  }
  let reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
  const lastErrors = {};
  const errorTimers = {};
  const errorCounters = {};
  function shouldLogError(errorType) {
    if (!errorCounters[errorType]) errorCounters[errorType] = { count: 0, lastShown: 0 };
    const now = Date.now();
    const errorData = errorCounters[errorType];
    if (errorData.count >= 5) return false;
    if (now - errorData.lastShown < 2000) return false;
    errorData.count++;
    errorData.lastShown = now;
    return true;
  }
  if (reason == 405) {
    console.log(chalk.bold.redBright(`[ ⚠️ ] 𝘾𝙤𝙣𝙚𝙭𝙞ó𝙣 𝙧𝙚𝙚𝙢𝙥𝙡𝙖𝙯𝙖𝙙𝙖, 𝙍𝙚𝙞𝙣𝙞𝙘𝙞𝙖𝙣𝙙𝙤...`));
  }
  if (connection === 'close') {
    if (reason === DisconnectReason.badSession) {
      if (shouldLogError('badSession')) {
        conn.logger.error(`[ ⚠️ ] 𝙎𝙚𝙨𝙞ó𝙣 𝙞𝙣𝙘𝙤𝙧𝙧𝙚𝙘𝙩𝙖, 𝙚𝙡𝙞𝙢𝙞𝙣𝙖 𝙡𝙖 𝙘𝙖𝙧𝙥𝙚𝙩𝙖 ${global.authFile} 𝙮 𝙚𝙨𝙘𝙖𝙣𝙚𝙖 𝙣𝙪𝙚𝙫𝙖𝙢𝙚𝙣𝙩𝙚.`);
      }
      await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.connectionClosed) {
      if (shouldLogError('connectionClosed')) {
        conn.logger.warn(`[ ⚠️ ] 𝘾𝙤𝙣𝙚𝙭𝙞ó𝙣 𝙘𝙚𝙧𝙧𝙖𝙙𝙖, 𝙧𝙚𝙘𝙤𝙣𝙚𝙘𝙩𝙖𝙣𝙙𝙤...`);
      }
      await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.connectionLost) {
      if (shouldLogError('connectionLost')) {
        conn.logger.warn(`[ ⚠️ ] 𝘾𝙤𝙣𝙚𝙭𝙞ó𝙣 𝙥𝙚𝙧𝙙𝙞𝙙𝙖, 𝙧𝙚𝙘𝙤𝙣𝙚𝙘𝙩𝙖𝙣𝙙𝙤...`);
      }
      await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.connectionReplaced) {
      if (shouldLogError('connectionReplaced')) {
        conn.logger.error(`[ ⚠️ ] 𝘾𝙤𝙣𝙚𝙭𝙞ó𝙣 𝙧𝙚𝙚𝙢𝙥𝙡𝙖𝙯𝙖𝙙𝙖, 𝙨𝙚 𝙝𝙖 𝙖𝙗𝙞𝙚𝙧𝙩𝙤 𝙤𝙩𝙧𝙖 𝙨𝙚𝙨𝙞ó𝙣.`);
      }
      await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.loggedOut) {
      if (shouldLogError('loggedOut')) {
        conn.logger.error(`[ ⚠️ ] 𝘾𝙤𝙣𝙚𝙭𝙞𝙤𝙣 𝙘𝙚𝙧𝙧𝙖𝙙𝙖, 𝙚𝙡𝙞𝙢𝙞𝙣𝙖 𝙡𝙖 𝙘𝙖𝙧𝙥𝙚𝙩𝙖 ${global.authFile} 𝙮 𝙚𝙨𝙘𝙖𝙣𝙚𝙖 𝙣𝙪𝙚𝙫𝙖𝙢𝙚𝙣𝙩𝙚.`);
      }
    } else if (reason === DisconnectReason.restartRequired) {
      if (isFirstConnection) {
        isFirstConnection = false;
      } else {
        if (shouldLogError('restartRequired')) {
          conn.logger.info(`[ ⚠️ ] 𝙍𝙚𝙞𝙣𝙞𝙘𝙞𝙤 𝙣𝙚𝙘𝙚𝙨𝙖𝙧𝙞𝙤, 𝙧𝙚𝙘𝙤𝙣𝙚𝙘𝙩𝙖𝙣𝙙𝙤...`);
        }
        await global.reloadHandler(true).catch(console.error);
      }
    } else if (reason === DisconnectReason.timedOut) {
      if (shouldLogError('timedOut')) {
        conn.logger.warn(`[ ⚠️ ] 𝙏𝙞𝙚𝙢𝙥𝙤 𝙙𝙚 𝙘𝙤𝙣𝙚𝙭𝙞ó𝙣 𝙖𝙜𝙤𝙩𝙖𝙙𝙤, 𝙧𝙚𝙘𝙤𝙣𝙚𝙘𝙩𝙖𝙣𝙙𝙤...`);
      }
      await global.reloadHandler(true).catch(console.error);
    } else {
      const unknownError = `unknown_${reason || ''}_${connection || ''}`;
      if (shouldLogError(unknownError)) {
        conn.logger.warn(`[ ⚠️ ] 𝙍𝙖𝙯ó𝙣 𝙙𝙚 𝙙𝙚𝙨𝙘𝙤𝙣𝙚𝙭𝙞ó𝙣 𝙙𝙚𝙨𝙘𝙤𝙣𝙤𝙘𝙞𝙙𝙖. ${reason || ''}: ${connection || ''}`);
      }
      await global.reloadHandler(true).catch(console.error);
    }
  }
}

process.on('uncaughtException', console.error);

let isInit = true;
let handler = await import('./handler.js');

global.reloadHandler = async function (restatConn) {
  try {
    const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error);
    if (Object.keys(Handler || {}).length) handler = Handler;
  } catch (e) {
    console.error(e);
  }
  if (restatConn) {
    const oldChats = global.conn.chats;
    try {
      global.conn.ws.close();
    } catch { }
    conn.ev.removeAllListeners();
    global.conn = makeWASocket(connectionOptions, { chats: oldChats });
    store?.bind(conn);
    lidResolver.conn = global.conn;
    isInit = true;
  }
  if (!isInit) {
    conn.ev.off('messages.upsert', conn.handler);
    conn.ev.off('group-participants.update', conn.participantsUpdate);
    conn.ev.off('groups.update', conn.groupsUpdate);
    conn.ev.off('message.delete', conn.onDelete);
    conn.ev.off('call', conn.onCall);
    conn.ev.off('connection.update', conn.connectionUpdate);
    conn.ev.off('creds.update', conn.credsUpdate);
  }

  conn.welcome = '👋 𝘽𝙞𝙚𝙣𝙫𝙚𝙣𝙞𝙙𝙤/𝙖!\n@user';
  conn.bye = '👋 𝙃𝙖𝙨𝙩𝙖 𝙡𝙪𝙚𝙜𝙤!\n@user';
  conn.spromote = '*[ ℹ️ ] @user 𝙁𝙪𝙚 𝙥𝙧𝙤𝙢𝙤𝙫𝙞𝙙𝙤 𝙖 𝙖𝙙𝙢𝙞𝙣𝙞𝙨𝙩𝙧𝙖𝙙𝙤𝙧.*';
  conn.sdemote = '*[ ℹ️ ] @user 𝙁𝙪𝙚 𝙙𝙚𝙜𝙧𝙖𝙙𝙖𝙙𝙤 𝙙𝙚 𝙖𝙙𝙢𝙞𝙣𝙞𝙨𝙩𝙧𝙖𝙙𝙤𝙧.*';
  conn.sDesc = '*[ ℹ️ ] 𝙇𝙖 𝙙𝙚𝙨𝙘𝙧𝙞𝙥𝙘𝙞ó𝙣 𝙙𝙚𝙡 𝙜𝙧𝙪𝙥𝙤 𝙝𝙖 𝙨𝙞𝙙𝙤 𝙢𝙤𝙙𝙞𝙛𝙞𝙘𝙖𝙙𝙖.*';
  conn.sSubject = '*[ ℹ️ ] 𝙀𝙡 𝙣𝙤𝙢𝙗𝙧𝙚 𝙙𝙚𝙡 𝙜𝙧𝙪𝙥𝙤 𝙝𝙖 𝙨𝙞𝙙𝙤 𝙢𝙤𝙙𝙞𝙛𝙞𝙘𝙖𝙙𝙤.*';
  conn.sIcon = '*[ ℹ️ ] 𝙎𝙚 𝙝𝙖 𝙘𝙖𝙢𝙗𝙞𝙖𝙙𝙤 𝙡𝙖 𝙛𝙤𝙩𝙤 𝙙𝙚 𝙥𝙚𝙧𝙛𝙞𝙡 𝙙𝙚𝙡 𝙜𝙧𝙪𝙥𝙤.*';
  conn.sRevoke = '*[ ℹ️ ] 𝙀𝙡 𝙚𝙣𝙡𝙖𝙘𝙚 𝙙𝙚 𝙞𝙣𝙫𝙞𝙩𝙖𝙘𝙞ó𝙣 𝙖𝙡 𝙜𝙧𝙪𝙥𝙤 𝙝𝙖 𝙨𝙞𝙙𝙤 𝙧𝙚𝙨𝙩𝙖𝙗𝙡𝙚𝙘𝙞𝙙𝙤.*';

  const originalHandler = handler.handler.bind(global.conn);
  conn.handler = async function (chatUpdate) {
    try {
      if (chatUpdate.messages) {
        chatUpdate.messages = await interceptMessages(chatUpdate.messages, lidResolver);

        for (let i = 0; i < chatUpdate.messages.length; i++) {
          const message = chatUpdate.messages[i];

          if (message?.key?.remoteJid?.endsWith('@g.us')) {
            try {
              const fullyProcessedMessage = await processMessageForDisplay(message, lidResolver);
              chatUpdate.messages[i] = fullyProcessedMessage;

              const messageText = extractAllText(fullyProcessedMessage);
              if (messageText && messageText.includes('@') && /(@\d{8,20})/.test(messageText)) {
                const lidMatches = messageText.match(/@(\d{8,20})/g);
              }
            } catch (error) {
              console.error('𝙀𝙧𝙧𝙤𝙧 𝙚𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙖𝙢𝙞𝙚𝙣𝙩𝙤 𝙛𝙞𝙣𝙖𝙡 𝙙𝙚 𝙢𝙚𝙣𝙨𝙖𝙟𝙚:', error);
            }
          }
        }
      }

      return await originalHandler(chatUpdate);
    } catch (error) {
      console.error('𝙀𝙧𝙧𝙤𝙧 𝙚𝙣 𝙝𝙖𝙣𝙙𝙡𝙚𝙧 𝙞𝙣𝙩𝙚𝙧𝙘𝙚𝙥𝙩𝙤𝙧:', error);
      return await originalHandler(chatUpdate);
    }
  };

  conn.participantsUpdate = handler.participantsUpdate.bind(global.conn);
  conn.groupsUpdate = handler.groupsUpdate.bind(global.conn);
  conn.onDelete = handler.deleteUpdate.bind(global.conn);
  conn.onCall = handler.callUpdate.bind(global.conn);
  conn.connectionUpdate = connectionUpdate.bind(global.conn);
  conn.credsUpdate = saveCreds.bind(global.conn, true);

  const currentDateTime = new Date();
  const messageDateTime = new Date(conn.ev);
  if (currentDateTime >= messageDateTime) {
    const chats = Object.entries(conn.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0]);
  } else {
    const chats = Object.entries(conn.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0]);
  }

  conn.ev.on('messages.upsert', conn.handler);
  conn.ev.on('group-participants.update', conn.participantsUpdate);
  conn.ev.on('groups.update', conn.groupsUpdate);
  conn.ev.on('message.delete', conn.onDelete);
  conn.ev.on('call', conn.onCall);
  conn.ev.on('connection.update', conn.connectionUpdate);
  conn.ev.on('creds.update', conn.credsUpdate);
  isInit = false;
  return true;
};

conn.lid = {
  getUserInfo: (lidNumber) => lidDataManager.getUserInfo(lidNumber),
  getUserInfoByJid: (jid) => lidDataManager.getUserInfoByJid(jid),
  findLidByJid: (jid) => lidDataManager.findLidByJid(jid),
  getAllUsers: () => lidDataManager.getAllUsers(),
  getStats: () => lidDataManager.getStats(),
  getUsersByCountry: () => lidDataManager.getUsersByCountry(),
  validatePhoneNumber: (phoneNumber) => {
    if (!lidResolver.phoneValidator) return false;
    return lidResolver.phoneValidator.isValidPhoneNumber(phoneNumber);
  },
  detectPhoneInLid: (lidString) => {
    if (!lidResolver.phoneValidator) return { isPhone: false };
    return lidResolver.phoneValidator.detectPhoneInLid(lidString);
  },
  forceSave: () => {
    try {
      lidResolver.forceSave();
      return true;
    } catch (error) {
      console.error('𝙀𝙧𝙧𝙤𝙧 𝙜𝙪𝙖𝙧𝙙𝙖𝙣𝙙𝙤 𝙘𝙖𝙘𝙝é 𝙇𝙄𝘿:', error);
      return false;
    }
  },
  getCacheInfo: () => {
    try {
      const stats = lidDataManager.getStats();
      const analysis = lidResolver.analyzePhoneNumbers();

      return `📱 *𝙀𝙎𝙏𝘼𝘿í𝙎𝙏𝙄𝘾𝘼𝙎 𝘿𝙀𝙇 𝘾𝘼𝘾𝙃é 𝙇𝙄𝘿*

📊 *𝙂𝙚𝙣𝙚𝙧𝙖𝙡:*
• 𝙏𝙤𝙩𝙖𝙡 𝙙𝙚 𝙚𝙣𝙩𝙧𝙖𝙙𝙖𝙨: ${stats.total}
• 𝙀𝙣𝙩𝙧𝙖𝙙𝙖𝙨 𝙫á𝙡𝙞𝙙𝙖𝙨: ${stats.valid}
• 𝙉𝙤 𝙚𝙣𝙘𝙤𝙣𝙩𝙧𝙖𝙙𝙖𝙨: ${stats.notFound}
• 𝘾𝙤𝙣 𝙚𝙧𝙧𝙤𝙧𝙚𝙨: ${stats.errors}

📞 *𝙉ú𝙢𝙚𝙧𝙤𝙨 𝙩𝙚𝙡𝙚𝙛ó𝙣𝙞𝙘𝙤𝙨:*
• 𝘿𝙚𝙩𝙚𝙘𝙩𝙖𝙙𝙤𝙨: ${stats.phoneNumbers}
• 𝘾𝙤𝙧𝙧𝙚𝙜𝙞𝙙𝙤𝙨: ${stats.corrected}
• 𝙋𝙧𝙤𝙗𝙡𝙚𝙢á𝙩𝙞𝙘𝙤𝙨: ${analysis.stats.phoneNumbersProblematic}

🗂️ *𝘾𝙖𝙘𝙝é:*
• 𝘼𝙧𝙘𝙝𝙞𝙫𝙤: ${stats.cacheFile}
• 𝙀𝙭𝙞𝙨𝙩𝙚: ${stats.fileExists ? '𝙎í' : '𝙉𝙤'}`;
    } catch (error) {
      return `⚠️ 𝙀𝙧𝙧𝙤𝙧 𝙤𝙗𝙩𝙚𝙣𝙞𝙚𝙣𝙙𝙤 𝙞𝙣𝙛𝙤𝙧𝙢𝙖𝙘𝙞ó𝙣: ${error.message}`;
    }
  },
  forcePhoneCorrection: () => {
    try {
      const result = lidResolver.autoCorrectPhoneNumbers();

      if (result.corrected > 0) {
        return `✅ 𝙎𝙚 𝙘𝙤𝙧𝙧𝙞𝙜𝙞𝙚𝙧𝙤𝙣 ${result.corrected} 𝙣ú𝙢𝙚𝙧𝙤𝙨 𝙩𝙚𝙡𝙚𝙛ó𝙣𝙞𝙘𝙤𝙨 𝙖𝙪𝙩𝙤𝙢á𝙩𝙞𝙘𝙖𝙢𝙚𝙣𝙩𝙚.`;
      } else {
        return '✅ 𝙉𝙤 𝙨𝙚 𝙚𝙣𝙘𝙤𝙣𝙩𝙧𝙖𝙧𝙤𝙣 𝙣ú𝙢𝙚𝙧𝙤𝙨 𝙩𝙚𝙡𝙚𝙛ó𝙣𝙞𝙘𝙤𝙨 𝙦𝙪𝙚 𝙧𝙚𝙦𝙪𝙞𝙚𝙧𝙖𝙣 𝙘𝙤𝙧𝙧𝙚𝙘𝙘𝙞ó𝙣.';
      }
    } catch (error) {
      return `⚠️ 𝙀𝙧𝙧𝙤𝙧 𝙚𝙣 𝙘𝙤𝙧𝙧𝙚𝙘𝙘𝙞ó𝙣 𝙖𝙪𝙩𝙤𝙢á𝙩𝙞𝙘𝙖: ${error.message}`;
    }
  },
  resolveLid: async (lidJid, groupChatId) => {
    try {
      return await lidResolver.resolveLid(lidJid, groupChatId);
    } catch (error) {
      console.error('𝙀𝙧𝙧𝙤𝙧 𝙧𝙚𝙨𝙤𝙡𝙫𝙞𝙚𝙣𝙙𝙤 𝙇𝙄𝘿:', error);
      return lidJid;
    }
  },
  processTextMentions: async (text, groupId) => {
    try {
      return await processTextMentions(text, groupId, lidResolver);
    } catch (error) {
      console.error('𝙀𝙧𝙧𝙤𝙧 𝙥𝙧𝙤𝙘𝙚𝙨𝙖𝙣𝙙𝙤 𝙢𝙚𝙣𝙘𝙞𝙤𝙣𝙚𝙨 𝙚𝙣 𝙩𝙚𝙭𝙩𝙤:', error);
      return text;
    }
  }
};

const pluginFolder = global.__dirname(join(__dirname, './plugins/index'));
const pluginFilter = (filename) => /\.js$/.test(filename);
global.plugins = {};

async function filesInit() {
  for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
    try {
      const file = global.__filename(join(pluginFolder, filename));
      const module = await import(file);
      global.plugins[filename] = module.default || module;
    } catch (e) {
      conn.logger.error(e);
      delete global.plugins[filename];
    }
  }
}
filesInit().then((_) => Object.keys(global.plugins)).catch(console.error);

global.reload = async (_ev, filename) => {
  if (pluginFilter(filename)) {
    const dir = global.__filename(join(pluginFolder, filename), true);
    if (filename in global.plugins) {
      if (existsSync(dir)) conn.logger.info(` 𝙖𝙘𝙩𝙪𝙖𝙡𝙞𝙯𝙖𝙙𝙤 - '${filename}'`);
      else {
        conn.logger.warn(`𝙚𝙡𝙞𝙢𝙞𝙣𝙖𝙙𝙤 - '${filename}'`);
        return delete global.plugins[filename];
      }
    } else conn.logger.info(`𝙣𝙪𝙚𝙫𝙤 - '${filename}'`);
    const err = syntaxerror(readFileSync(dir), filename, {
      sourceType: 'module',
      allowAwaitOutsideFunction: true,
    });
    if (err) conn.logger.error(`𝙚𝙧𝙧𝙤𝙧 𝙙𝙚 𝙨𝙞𝙣𝙩𝙖𝙭𝙞𝙨 - '${filename}'\n${format(err)}`);
    else {
      try {
        const module = (await import(`${global.__filename(dir)}?update=${Date.now()}`));
        global.plugins[filename] = module.default || module;
      } catch (e) {
        conn.logger.error(`𝙚𝙧𝙧𝙤𝙧 𝙚𝙣 𝙥𝙡𝙪𝙜𝙞𝙣 '${filename}\n${format(e)}'`);
      } finally {
        global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)));
      }
    }
  }
};
Object.freeze(global.reload);
watch(pluginFolder, global.reload);
await global.reloadHandler();

setInterval(async () => {
  if (stopped === 'close' || !conn || !conn?.user) return;
  await clearTmp();
}, 180000);

setInterval(async () => {
  if (stopped === 'close' || !conn || !conn?.user) return;
  const _uptime = process.uptime() * 1000;
  const uptime = clockString(_uptime);
  const bio = `• 𝘼𝙘𝙩𝙞𝙫𝙤: ${uptime} | KARBOT-MD`;
  await conn?.updateProfileStatus(bio).catch((_) => _);
}, 60000);

setInterval(async () => {
  if (stopped === 'close' || !conn || !conn?.user || !lidResolver) return;

  try {
    const stats = lidDataManager.getStats();

    if (stats.total > 800) {
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      let cleanedCount = 0;

      for (const [key, entry] of lidResolver.cache.entries()) {
        if (entry.timestamp < sevenDaysAgo && (entry.notFound || entry.error)) {
          lidResolver.cache.delete(key);
          if (entry.jid && lidResolver.jidToLidMap.has(entry.jid)) {
            lidResolver.jidToLidMap.delete(entry.jid);
          }
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        lidResolver.markDirty();
      }
    }

    if (Math.random() < 0.1) {
      const correctionResult = lidResolver.autoCorrectPhoneNumbers();
    }
  } catch (error) {
    console.error('𝙀𝙧𝙧𝙤𝙧 𝙚𝙣 𝙡𝙞𝙢𝙥𝙞𝙚𝙯𝙖 𝙙𝙚 𝙘𝙖𝙘𝙝é 𝙇𝙄𝘿:', error.message);
  }
}, 30 * 60 * 1000);

function clockString(ms) {
  const d = isNaN(ms) ? '--' : Math.floor(ms / 86400000);
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24;
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
  return [d, 'd ', h, 'h ', m, 'm ', s, 's '].map((v) => v.toString().padStart(2, 0)).join('');
}

const gracefulShutdown = () => {
  if (lidResolver?.isDirty) {
    try {
      lidResolver.forceSave();
    } catch (error) {
      console.error('𝙀𝙧𝙧𝙤𝙧 𝙜𝙪𝙖𝙧𝙙𝙖𝙣𝙙𝙤 𝙘𝙖𝙘𝙝é 𝙇𝙄𝘿:', error.message);
    }
  }
};

process.on('exit', gracefulShutdown);
process.on('SIGINT', () => {
  gracefulShutdown();
  process.exit(0);
});
process.on('SIGTERM', () => {
  gracefulShutdown();
  process.exit(0);
});
process.on('unhandledRejection', (reason, promise) => {
  if (reason && reason.message && reason.message.includes('lid')) {
    console.error('𝙀𝙧𝙧𝙤𝙧 𝙣𝙤 𝙢𝙖𝙣𝙚𝙟𝙖𝙙𝙤 𝙧𝙚𝙡𝙖𝙘𝙞𝙤𝙣𝙖𝙙𝙤 𝙘𝙤𝙣 𝙇𝙄𝘿:', reason);
  }
});

async function _quickTest() {
  const test = await Promise.all([
    spawn('ffmpeg'),
    spawn('ffprobe'),
    spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
    spawn('convert'),
    spawn('magick'),
    spawn('gm'),
    spawn('find', ['--version']),
  ].map((p) => {
    return Promise.race([
      new Promise((resolve) => {
        p.on('close', (code) => {
          resolve(code !== 127);
        });
      }),
      new Promise((resolve) => {
        p.on('error', (_) => resolve(false));
      })]);
  }));
  const [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test;
  global.support = { ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find };
  Object.freeze(global.support);
}