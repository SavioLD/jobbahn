/* =====================================================================
   Den Vergleicher lokal laufen lassen – ohne Cloudflare-Konto.
     node vergleicher/lokal.mjs
   → http://localhost:8787/intern   (Passwort: Umgebungsvariable ADMIN_TOKEN, Standard „lokal“)
   Daten liegen in vergleicher/lokal.sqlite (nicht im Repo).
   ===================================================================== */
import http from "node:http";
import worker, { wartung } from "./src/index.js";
import { lokaleD1 } from "./test/d1-lokal.mjs";

const port = Number(process.env.PORT || 8787);
const env = {
  DB: lokaleD1(process.env.DB_DATEI || new URL("./lokal.sqlite", import.meta.url).pathname),
  ADMIN_TOKEN: process.env.ADMIN_TOKEN || "lokal",
  ERLAUBTE_ORIGINS: process.env.ERLAUBTE_ORIGINS || "",
  LOKALE_ZIELE: process.env.LOKALE_ZIELE || ""   /* "1" = auch http://localhost als Lead-Table-Ziel (nur zum Testen) */
};

http.createServer(async (req, res) => {
  try {
    const teile = [];
    for await (const t of req) teile.push(t);
    const anfrage = new Request(`http://${req.headers.host}${req.url}`, {
      method: req.method,
      headers: Object.entries(req.headers).filter(([, v]) => typeof v === "string"),
      body: ["GET", "HEAD"].includes(req.method) ? undefined : Buffer.concat(teile)
    });
    const antwort = await worker.fetch(anfrage, env);
    res.writeHead(antwort.status, Object.fromEntries(antwort.headers));
    res.end(Buffer.from(await antwort.arrayBuffer()));
  } catch (err) {
    res.writeHead(500); res.end(String(err));
  }
}).listen(port, () => console.log(`Vergleicher lokal: http://localhost:${port}/intern  (Passwort: ${env.ADMIN_TOKEN === "lokal" ? "lokal" : "aus ADMIN_TOKEN"})`));

/* Wie der Cron in Cloudflare: alle 15 Minuten nachsenden und Löschfrist prüfen */
setInterval(() => wartung(env).catch(err => console.error("Wartung:", err)), 15 * 60 * 1000);
