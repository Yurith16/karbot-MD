import { watchFile, unwatchFile } from "fs";
import chalk from "chalk";
import { fileURLToPath } from "url";
import moment from "moment-timezone";

// Configuración básica del Bot
global.botnumber = "";
global.confirmCode = "";
global.authFile = `KarbotSession`;

// Configuración de sesión
global.isBaileysFail = false;
global.defaultLenguaje = "es";

// Owner del bot
global.owner = [["50496926150", "👑 HERNANDEZ 👑", true]];

global.suittag = ["50496926150"];
global.prems = ["50496926150"];

// APIs necesarias
global.BASE_API_DELIRIUS = "https://delirius-apiofc.vercel.app";

// Metadata para stickers y mensajes
global.packname = "Karbot-Sticker";
global.author = "HERNANDEZ";
global.wm = "KARBOT-MD";

// Mensajes de espera
global.wait = "*⏳ Cargando...*";
global.waitt = "*⏳ Procesando...*";

// Configuración de tiempo
global.d = new Date(new Date() + 3600000);
global.locale = "es";
global.dia = d.toLocaleDateString(locale, { weekday: "long" });
global.fecha = d.toLocaleDateString("es", {
  day: "numeric",
  month: "numeric",
  year: "numeric",
});
global.mes = d.toLocaleDateString("es", { month: "long" });
global.año = d.toLocaleDateString("es", { year: "numeric" });
global.tiempo = d.toLocaleString("en-US", {
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hour12: true,
});

// Información de tiempo para mensajes
global.botdate = `*📅 Fecha:* ${moment.tz("America/Mexico_City").format("DD/MM/YY")}`;
global.bottime = `*⏰ Hora:* ${moment.tz("America/Mexico_City").format("HH:mm:ss")}`;

// Configuración de archivos permitidos
global.pdoc = [
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/msword",
  "application/pdf",
  "text/rtf",
];

// Configuración para GIFs en stickers
global.fgif = {
  key: { participant: "0@s.whatsapp.net" },
  message: {
    videoMessage: {
      title: "KARBOT-MD",
      h: `Hmm`,
      seconds: "999999999",
      gifPlayback: "true",
      caption: `KARBOT-MD • ${moment.tz("America/Mexico_City").format("HH:mm:ss")}`,
      jpegThumbnail: "",
    },
  },
};

global.multiplier = 99;

// Watch file for changes
const file = fileURLToPath(import.meta.url);
watchFile(file, () => {
  unwatchFile(file);
  console.log(chalk.redBright("Se actualizó config.js"));
  import(`${file}?update=${Date.now()}`);
});
