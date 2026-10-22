/* Macht aus src/intern.html ein JS-Modul (src/intern-seite.js), damit der Worker die
   Seite ohne Zusatz-Konfiguration ausliefern kann. Läuft automatisch vor Test und Deploy. */
import { readFileSync, writeFileSync } from "node:fs";
const html = readFileSync(new URL("./src/intern.html", import.meta.url), "utf8");
writeFileSync(new URL("./src/intern-seite.js", import.meta.url),
  `/* Erzeugt von seite-bauen.mjs aus intern.html – nicht von Hand ändern. */\nexport default ${JSON.stringify(html)};\n`);
console.log("src/intern-seite.js erzeugt");
