/* =====================================================================
   Browser-Test fürs Kurzprofil (Playwright, Chromium).
     node build.mjs && NODE_PATH=$(npm root -g) node test/formular-test.cjs
   Prüft auf vier Handy-Größen: alle Wege durchs Formular, Deeplinks,
   Pflichtfeld-Fehler, dass die Seite beim Schrittwechsel nicht springt,
   dass der Weiter-Button immer im Bild ist, und den Payload, der an die
   Lead Table ginge.
   ===================================================================== */
const { chromium } = require("playwright");
const { spawn } = require("child_process");
const path = require("path");

const PORT = 4173;
const BASE = `http://127.0.0.1:${PORT}`;
const VIEWPORTS = [[360, 640], [375, 667], [390, 844], [414, 896]];
const FAELLE = [
  { name: "ohne Deeplink", url: "/profil.html", schritte: 14, kategorie: "Metall & Maschinenbau", beruf: "Schweißer" },
  { name: "?beruf=zerspanung + UTM", url: "/profil.html?beruf=zerspanung&utm_source=meta&utm_campaign=pool-zerspanung", schritte: 13, kategorie: "Metall & Maschinenbau", utm: true },
  { name: "?beruf=elektro&als=mechatroniker", url: "/profil.html?beruf=elektro&als=mechatroniker", schritte: 12, kategorie: "Elektro & Mechatronik", beruf: "Mechatroniker" },
  { name: "Alias ?beruf=cnc", url: "/profil.html?beruf=cnc", schritte: 13, kategorie: "Metall & Maschinenbau" },
  { name: "Büro ?beruf=buero", url: "/profil.html?beruf=buero", schritte: 13, kategorie: "Büro & Verwaltung" }
];

function fail(msg) { console.error("FEHLER: " + msg); process.exitCode = 1; }

(async () => {
  const server = spawn("python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1"], { cwd: path.join(__dirname, "..", "dist"), stdio: "ignore" });
  await new Promise(r => setTimeout(r, 700));
  const browser = await chromium.launch();
  const ergebnisse = [];

  try {
    for (const [w, h] of VIEWPORTS) {
      for (const fall of FAELLE) {
        const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
        const page = await ctx.newPage();
        const jsFehler = [];
        page.on("pageerror", e => jsFehler.push(e.message));
        await page.goto(BASE + fall.url);

        const gesamt = await page.$$eval(".schritt", els => els.length);
        if (gesamt !== fall.schritte) fail(`${w}x${h} ${fall.name}: ${gesamt} statt ${fall.schritte} Schritte`);

        /* Pflichtfrage ohne Antwort → Fehlermeldung, kein Weiterkommen */
        await page.click("#btn-weiter");
        const fehlerText = await page.textContent(".schritt.ist-aktiv [data-fehler]");
        if (!fehlerText) fail(`${w}x${h} ${fall.name}: keine Fehlermeldung bei leerer Pflichtfrage`);

        /* Sprung = scrollY ändert sich durch den Schrittwechsel selbst.
           Gemessen direkt vor und nach dem Tipp, der den Wechsel auslöst
           (Playwright scrollt vorher selbst zum Ziel – das zählt nicht). */
        const spruenge = [], hoehen = new Set(), buttonY = new Set();
        let kontaktHoehe = 0;
        const scrollY = () => page.evaluate(() => Math.round(window.scrollY));
        async function ausloesen(ziel, key) {
          await ziel.scrollIntoViewIfNeeded();
          const vor = await scrollY();
          await ziel.click();
          await page.waitForTimeout(320);
          const nach = await scrollY();
          if (vor !== nach) spruenge.push(`${key}: ${vor}→${nach}`);
        }
        const weiterBtn = page.locator("#btn-weiter");
        for (let i = 0; i < gesamt; i++) {
          const s = page.locator(".schritt.ist-aktiv");
          const key = await s.getAttribute("data-key");
          const typ = await s.getAttribute("data-typ");
          const box = await page.locator("#schritte").boundingBox();
          /* Weiter-Button muss ohne Scrollen sichtbar sein (klebt unten am Bildschirm) */
          const imBild = await page.evaluate(() => { const r = document.getElementById("btn-weiter").getBoundingClientRect(); return r.top >= 0 && r.bottom <= window.innerHeight + 1; });
          if (!imBild) buttonY.add(key);
          if (typ !== "kontakt") hoehen.add(Math.round(box.height));
          else kontaktHoehe = Math.round(box.height);

          if (typ === "kategorie") {
            await ausloesen(s.locator(".option", { hasText: fall.kategorie }), key);
          } else if (typ === "beruf") {
            if (fall.beruf) await ausloesen(s.locator(".option", { hasText: fall.beruf }).first(), key);
            else {
              await s.locator(".option", { hasText: "Anderer Beruf" }).click();
              await page.fill("#beruf-anderer", "Werkzeugmechaniker");
              await ausloesen(weiterBtn, key);
            }
          } else if (typ === "einfach") {
            await ausloesen(s.locator(".option").nth(1), key);
          } else if (typ === "mehrfach") {
            await s.locator(".option").nth(1).click();
            await ausloesen(weiterBtn, key);
          } else if (typ === "plz-ort") {
            await page.fill("#plz", "D-70173");          /* Buchstaben und Zeichen werden herausgefiltert */
            await page.fill("#ort", "Stuttgart");
            await ausloesen(weiterBtn, key);
          } else if (typ === "text") {
            const label = (await page.textContent("#btn-weiter")).trim();
            if (label !== "Überspringen") fail(`${w}x${h}: Sperrliste leer, Button heißt „${label}“`);
            await page.fill("#sperrliste", "Muster GmbH");
            await ausloesen(weiterBtn, key);
          } else if (typ === "kontakt") {
            await page.fill("#vorname", "Max");
            await page.fill("#nachname", "Mustermann");
            await page.fill("#telefon", "0151 23456789");
            await page.fill("#email", "max@beispiel.de");
            await s.locator(".option", { hasText: "Abends" }).click();
            await page.click("#btn-weiter");
            const ew = await page.textContent(".schritt.ist-aktiv [data-fehler]");
            if (!ew.includes("Okay")) fail(`${w}x${h}: Einwilligung nicht erzwungen`);
            await page.check("#einwilligung");
            await page.click("#btn-weiter");
            await page.waitForTimeout(320);
          }
        }

        await page.waitForSelector("#danke:not([hidden])", { timeout: 5000 }).catch(async () => {
          const aktiv = await page.getAttribute(".schritt.ist-aktiv", "data-key").catch(() => "?");
          const f = await page.textContent(".schritt.ist-aktiv [data-fehler]").catch(() => "");
          throw new Error(`${w}x${h} ${fall.name}: kein Danke – hängt bei „${aktiv}“ (${f})`);
        });
        const payload = JSON.parse(await page.textContent("#danke pre"));
        const pflicht = ["vorname", "nachname", "telefon", "email", "berufskategorie", "beruf", "abschluss", "erfahrung", "plz", "ort", "fahrweg", "verfuegbarkeit", "gehalt", "schicht", "fuehrerschein", "deutsch", "lebenslauf", "sperrliste", "erreichbarkeit", "einwilligung", "datum", "quelle", "seite"];
        for (const k of pflicht) if (!payload[k]) fail(`${w}x${h} ${fall.name}: Payload-Feld „${k}“ leer`);
        if (payload.berufskategorie !== fall.kategorie) fail(`${w}x${h} ${fall.name}: Kategorie ${payload.berufskategorie}`);
        if (fall.beruf && payload.beruf !== fall.beruf) fail(`${w}x${h} ${fall.name}: Beruf ${payload.beruf}`);
        if (!fall.beruf && fall.name === "ohne Deeplink" && payload.beruf !== "Werkzeugmechaniker") fail("Anderer Beruf nicht übernommen");
        if (payload.plz !== "70173") fail(`${w}x${h}: PLZ ${payload.plz}`);
        if (fall.utm && (payload.utm_source !== "meta" || payload.utm_campaign !== "pool-zerspanung")) fail("UTM fehlt");
        if ("name" in payload || "fullname" in payload) fail("kombiniertes Namensfeld im Payload");
        if (jsFehler.length) fail(`${w}x${h} ${fall.name}: JS-Fehler ${jsFehler.join("; ")}`);

        ergebnisse.push({ viewport: `${w} × ${h}`, fall: fall.name, schritte: gesamt, spruenge: spruenge.length, hoehe: [...hoehen].join("/"), weiterImBild: buttonY.size ? "nein" : "ja", kontakt: kontaktHoehe });
        if (spruenge.length) fail(`${w}x${h} ${fall.name}: Seite springt (${spruenge.join(", ")})`);
        const spanne = (set) => Math.max(...set) - Math.min(...set);   /* 1 px Rundung ist erlaubt */
        if (spanne(hoehen) > 1) fail(`${w}x${h} ${fall.name}: Fragenschritte unterschiedlich hoch (${[...hoehen].join(", ")})`);
        if (buttonY.size) fail(`${w}x${h} ${fall.name}: Weiter-Button nicht im Bild bei ${[...buttonY].join(", ")}`);
        await ctx.close();
      }
    }
    /* Keine Seite darf am kleinen Handy seitlich überlaufen (z. B. durch lange Wörter in Überschriften). */
    const seiten = require("fs").readdirSync(path.join(__dirname, "..", "dist")).filter(f => f.endsWith(".html"));
    const ctx = await browser.newContext({ viewport: { width: 360, height: 640 } });
    const page = await ctx.newPage();
    for (const s of seiten) {
      await page.goto(`${BASE}/${s}`);
      const ueber = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (ueber > 0) fail(`${s}: läuft auf 360 px um ${ueber} px seitlich über`);
    }
    console.log(`${seiten.length} Seiten auf 360 px ohne seitlichen Überlauf geprüft.`);
    await ctx.close();
  } finally {
    await browser.close();
    server.kill();
  }
  console.table(ergebnisse);
  console.log(process.exitCode ? "Test mit Fehlern beendet." : "Alle Prüfungen bestanden.");
})();
