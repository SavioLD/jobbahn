/* Macht aus src/intern.html ein JS-Modul (src/intern-seite.js), damit der Worker die
   Seite ohne Zusatz-Konfiguration ausliefern kann. Läuft automatisch vor Test und Deploy. */
import { readFileSync, writeFileSync } from "node:fs";
/* Das Planeten-Symbol der Marke (assets/favicon.svg) kommt als Logo und Favicon in die Seite. */
const symbol = readFileSync(new URL("../assets/favicon.svg", import.meta.url), "utf8").trim();
const html = readFileSync(new URL("./src/intern.html", import.meta.url), "utf8")
  .replace("<!--SYMBOL-->", symbol.replace("<svg ", '<svg aria-hidden="true" focusable="false" '))
  .replace("<!--FAVICON-->", `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,${encodeURIComponent(symbol)}">`);
writeFileSync(new URL("./src/intern-seite.js", import.meta.url),
  `/* Erzeugt von seite-bauen.mjs aus intern.html – nicht von Hand ändern. */\nexport default ${JSON.stringify(html)};\n`);
console.log("src/intern-seite.js erzeugt");
