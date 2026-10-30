/* Der ganze Ablauf mit Datenbank (node:sqlite statt D1) und nachgebauter Lead Table:
   Einstellungen → Stelle → Bewerber → Treffer → Übergabe → Löschen → Wartung. */
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import worker, { wartung } from "../src/index.js";
import { lokaleD1 } from "./d1-lokal.mjs";

const PASSWORT = "test-passwort-123";
const URL_POOL = "https://lt.test/pool-alle", URL_POOL_ELEKTRO = "https://lt.test/pool-elektro";
const URL_MATCHES = "https://lt.test/matches", URL_FIRMA = "https://lt.test/firma-mueller";

let env, sendungen, leadTableKaputt;
globalThis.fetch = async (url, opt) => {
  if (leadTableKaputt) return new Response("{}", { status: 500 });
  sendungen.push({ url: String(url), daten: JSON.parse(opt.body) });
  return new Response("{}", { status: 200 });
};

async function anfrage(methode, pfad, body, { passwort = PASSWORT, origin } = {}) {
  const kopf = {};
  if (passwort) kopf.Authorization = `Bearer ${passwort}`;
  if (origin) kopf.Origin = origin;
  if (body) kopf["Content-Type"] = "application/json";
  const res = await worker.fetch(new Request(`https://vergleicher.test${pfad}`, { method: methode, headers: kopf, body: body ? JSON.stringify(body) : undefined }), env);
  const text = await res.text();
  let daten; try { daten = JSON.parse(text); } catch { daten = text; }
  return { status: res.status, daten, kopf: res.headers };
}

const bewerber = (x = {}) => ({
  vorname: "Max", nachname: "Muster", telefon: "0151 1111111", email: "max@beispiel.de",
  richtung: "elektro", berufskategorie: "Elektro & Mechatronik", beruf: "Mechatroniker",
  abschluss: "Abgeschlossene Ausbildung", erfahrung: "3 bis 5 Jahre", plz: "70173", ort: "Stuttgart",
  fahrweg: "Bis 30 km", verfuegbarkeit: "In 1 Monat", gehalt: "3.300 bis 3.800 €", schicht: "2-Schicht",
  fuehrerschein: "Klasse B", deutsch: "Muttersprache", lebenslauf: "Ja", sperrliste: "–", erreichbarkeit: "Abends",
  einwilligung: "Ja (ENTWURF 2026-10, 22.10.2026 14:05)", datum: "22.10.2026", quelle: "Bewerberportal Jobbahn", seite: "https://x/profil", ...x
});

const stelleMueller = {
  firma: "Müller Elektrotechnik GmbH", ansprechpartner: "Frau Müller", firmen_webhook: URL_FIRMA,
  firmen_info: "Familienbetrieb, ca. 60 Mitarbeiter, Schaltschrankbau.",
  titel: "Mechatroniker (m/w/d)", richtung: "elektro", berufe: ["Mechatroniker", "Elektroniker Betriebstechnik"],
  plz: "71032", ort: "Böblingen", start: "In 1 Monat", benefits: "Firmenwagen · 4-Tage-Woche",
  kriterien: {
    beruf: { gewicht: "muss" }, start: { gewicht: "wunsch" },
    abschluss: { wert: "Abgeschlossene Ausbildung", gewicht: "muss" },
    erfahrung: { wert: 3, gewicht: "wunsch" },
    gehalt: { von: 3000, bis: 3600, gewicht: "muss" },
    arbeitszeit: { werte: ["2-Schicht"], gewicht: "muss" },
    fuehrerschein: { werte: ["Klasse B"], gewicht: "wunsch" },
    deutsch: { wert: "Gut", gewicht: "muss" }
  }
};

const nach = (url) => sendungen.filter(s => s.url === url);

beforeEach(async () => {
  env = { DB: lokaleD1(), ADMIN_TOKEN: PASSWORT, ERLAUBTE_ORIGINS: "https://saviold.github.io,https://jobbahn.de" };
  sendungen = []; leadTableKaputt = false;
});

async function einrichten() {
  const r = await anfrage("PUT", "/api/intern/einstellungen", { matches_webhook: URL_MATCHES, pool_webhooks: { fallback: URL_POOL, elektro: URL_POOL_ELEKTRO }, loeschfrist_monate: 12 });
  assert.equal(r.status, 200, JSON.stringify(r.daten));
}

test("Interner Bereich ist geschützt, die Oberfläche lädt", async () => {
  assert.equal((await anfrage("GET", "/api/intern/uebersicht", null, { passwort: "" })).status, 401);
  assert.equal((await anfrage("GET", "/api/intern/uebersicht", null, { passwort: "falsch-falsch-1234" })).status, 401);
  assert.equal((await anfrage("GET", "/api/intern/uebersicht")).status, 200);
  const seite = await anfrage("GET", "/intern", null, { passwort: "" });
  assert.equal(seite.status, 200);
  assert.match(seite.daten, /<title>Vergleicher<\/title>/);
  assert.equal(seite.kopf.get("x-robots-tag"), "noindex, nofollow");
  const ohne = { ...env, ADMIN_TOKEN: "" }; const altEnv = env; env = ohne;
  assert.equal((await anfrage("GET", "/api/intern/uebersicht")).status, 503);
  env = altEnv;
});

test("CORS nur für erlaubte Herkunft", async () => {
  const ok = await worker.fetch(new Request("https://vergleicher.test/api/bewerber", { method: "OPTIONS", headers: { Origin: "https://saviold.github.io" } }), env);
  assert.equal(ok.headers.get("Access-Control-Allow-Origin"), "https://saviold.github.io");
  const fremd = await worker.fetch(new Request("https://vergleicher.test/api/bewerber", { method: "OPTIONS", headers: { Origin: "https://boese.example" } }), env);
  assert.equal(fremd.headers.get("Access-Control-Allow-Origin"), null);
});

test("Bewerber-Eingang prüft Pflichtfelder und ignoriert Bots", async () => {
  assert.equal((await anfrage("POST", "/api/bewerber", bewerber({ plz: "" }), { passwort: "" })).status, 400);
  assert.equal((await anfrage("POST", "/api/bewerber", bewerber({ richtung: "gibtsnicht" }), { passwort: "" })).status, 400);
  assert.equal((await anfrage("POST", "/api/bewerber", bewerber({ email: "kaputt" }), { passwort: "" })).status, 400);
  const bot = await anfrage("POST", "/api/bewerber", bewerber({ firma_website: "spam.example" }), { passwort: "" });
  assert.equal(bot.status, 200);
  const u = await anfrage("GET", "/api/intern/uebersicht");
  assert.deepEqual(u.daten.pool, {}, "Bot wurde nicht gespeichert");
});

test("Der ganze Ablauf: Stelle zuerst, dann Bewerber, dann Übergabe", async () => {
  await einrichten();

  /* 1. Stelle anlegen – Pool ist noch leer */
  const st = await anfrage("POST", "/api/intern/stellen", stelleMueller);
  assert.equal(st.status, 200, JSON.stringify(st.daten));
  assert.equal(st.daten.neueTreffer, 0);
  const stelleId = st.daten.id;

  /* 2. Passender Bewerber aus Stuttgart (ca. 22 km) */
  const a = await anfrage("POST", "/api/bewerber", bewerber(), { passwort: "", origin: "https://saviold.github.io" });
  assert.equal(a.status, 200);
  assert.equal(a.kopf.get("Access-Control-Allow-Origin"), "https://saviold.github.io");
  assert.equal(nach(URL_POOL_ELEKTRO).length, 1, "Bewerber in die Pool-Kachel seiner Richtung");
  assert.equal(nach(URL_POOL).length, 0);
  const treffer = nach(URL_MATCHES);
  assert.equal(treffer.length, 1, "Treffer in die Kachel „Matches“");
  assert.equal(treffer[0].daten.passende_firma, "Müller Elektrotechnik GmbH");
  assert.equal(treffer[0].daten.firma, undefined, "nicht ins Firmenfeld des Kontakts");
  assert.equal(treffer[0].daten.ueber_die_firma, "Familienbetrieb, ca. 60 Mitarbeiter, Schaltschrankbau.");
  assert.equal(treffer[0].daten.firmen_website, "–");
  assert.match(treffer[0].daten.match, /^Passt zu: .+ bei Müller Elektrotechnik GmbH .*km entfernt · 3 von 3 Wünschen$/);
  assert.equal(treffer[0].daten.vorname, "Max");
  assert.equal(treffer[0].daten.passung, "3 von 3 Wünschen");
  assert.match(treffer[0].daten.gruende, /✓ \d+ km Fahrweg/);
  assert.match(treffer[0].daten.bearbeiten, /^https:\/\/vergleicher\.test\/intern#stelle-/);

  /* 2a. Browser-Link statt Webhook wird abgelehnt */
  const falsch = await anfrage("PUT", "/api/intern/einstellungen", { matches_webhook: "https://app.lead-table.com/kunden/123/kacheln/456", pool_webhooks: { fallback: URL_POOL } });
  assert.equal(falsch.status, 400);
  assert.match(falsch.daten.fehler, /Link zur Kachel aus dem Browser/);

  /* 2b. Meta-Sofortformular über Make: Meta-Feldnamen, Richtung als Klartext */
  const meta = await anfrage("POST", "/api/bewerber", { full_name: "Erika Maria Muster", email: "erika@beispiel.de", phone_number: "+49 160 999", zip_code: "D-73728", richtung: "Elektro & Mechatronik", quelle: "Meta-Sofortformular" }, { passwort: "" });
  assert.equal(meta.status, 200);
  const metaPool = nach(URL_POOL_ELEKTRO).find(x => x.daten.email === "erika@beispiel.de");
  assert.ok(metaPool, "Meta-Lead landet in der Pool-Kachel seiner Richtung");
  assert.equal(metaPool.daten.vorname, "Erika Maria");
  assert.equal(metaPool.daten.nachname, "Muster");
  assert.equal(metaPool.daten.plz, "73728");
  assert.equal(metaPool.daten.richtung, "elektro");
  assert.equal(metaPool.daten.berufskategorie, "Elektro & Mechatronik");

  /* 3. Nicht passende Bewerber: zu weit, falsche Schicht, Gehalt zu hoch */
  await anfrage("POST", "/api/bewerber", bewerber({ email: "hh@beispiel.de", telefon: "0160 2", plz: "20095", ort: "Hamburg" }), { passwort: "" });
  await anfrage("POST", "/api/bewerber", bewerber({ email: "tz@beispiel.de", telefon: "0160 3", schicht: "Teilzeit" }), { passwort: "" });
  await anfrage("POST", "/api/bewerber", bewerber({ email: "geld@beispiel.de", telefon: "0160 4", gehalt: "Über 4.300 €" }), { passwort: "" });
  assert.equal(nach(URL_MATCHES).length, 1, "keine weiteren Treffer");

  /* 4. Passend, aber Müller steht auf seiner Sperrliste */
  await anfrage("POST", "/api/bewerber", bewerber({ vorname: "Eva", email: "eva@beispiel.de", telefon: "0160 5", sperrliste: "Müller GmbH" }), { passwort: "" });
  assert.equal(nach(URL_MATCHES).length, 1, "gesperrter Treffer geht nicht an die Lead Table");

  /* 5. Übersicht und Detail */
  const u = await anfrage("GET", "/api/intern/uebersicht");
  assert.equal(u.daten.pool.elektro, 6, "5 aus dem Portal + 1 aus dem Meta-Formular");
  assert.equal(u.daten.stellen[0].neu, 1);
  const d = await anfrage("GET", `/api/intern/stellen/${stelleId}`);
  assert.equal(d.daten.treffer.length, 2);
  const max = d.daten.treffer.find(t => t.bewerber.vorname === "Max");
  const eva = d.daten.treffer.find(t => t.bewerber.vorname === "Eva");
  assert.equal(max.status, "neu");
  assert.equal(eva.status, "gesperrt");

  /* 6. Gleiche Person meldet sich noch mal → kein Doppel, kein zweiter Treffer */
  await anfrage("POST", "/api/bewerber", bewerber({ telefon: "0151 1111111", email: "MAX@beispiel.de" }), { passwort: "" });
  assert.equal((await anfrage("GET", "/api/intern/uebersicht")).daten.pool.elektro, 6);
  assert.equal(nach(URL_MATCHES).length, 1);

  /* 7. Übergabe nach dem Telefonat → Kachel der Firma, ohne Sperrliste und Einwilligung */
  const ue = await anfrage("POST", `/api/intern/treffer/${max.id}`, { status: "uebergeben", notiz: "Sehr motiviert, ab 1.12. frei" });
  assert.equal(ue.status, 200, JSON.stringify(ue.daten));
  const anFirma = nach(URL_FIRMA);
  assert.equal(anFirma.length, 1);
  assert.equal(anFirma[0].daten.vorname, "Max");
  assert.equal(anFirma[0].daten.notiz, "Sehr motiviert, ab 1.12. frei");
  assert.equal(anFirma[0].daten.stelle, "Mechatroniker (m/w/d)");
  assert.ok(!("sperrliste" in anFirma[0].daten) && !("einwilligung" in anFirma[0].daten) && !("seite" in anFirma[0].daten));
  /* doppelt übergeben schickt nicht noch mal */
  await anfrage("POST", `/api/intern/treffer/${max.id}`, { status: "uebergeben", notiz: "" });
  assert.equal(nach(URL_FIRMA).length, 1);

  /* 8. Stelle besetzt → neue Bewerber werden nicht mehr verglichen */
  await anfrage("POST", `/api/intern/stellen/${stelleId}/status`, { status: "besetzt" });
  await anfrage("POST", "/api/bewerber", bewerber({ vorname: "Tom", email: "tom@beispiel.de", telefon: "0160 6" }), { passwort: "" });
  assert.equal(nach(URL_MATCHES).length, 1);
});

test("Bewerber zuerst: eine neue Stelle findet den vorhandenen Pool", async () => {
  await einrichten();
  await anfrage("POST", "/api/bewerber", bewerber({ richtung: "buero", berufskategorie: "Büro & Verwaltung", beruf: "Buchhaltung", schicht: "Teilzeit", email: "a@b.de", telefon: "1" }), { passwort: "" });
  await anfrage("POST", "/api/bewerber", bewerber({ richtung: "buero", beruf: "Sachbearbeitung", schicht: "Vollzeit tagsüber", email: "c@d.de", telefon: "2" }), { passwort: "" });
  assert.equal(nach(URL_POOL).length, 2, "Büro hat keine eigene Pool-Kachel → Rückfall-Kachel");
  const st = await anfrage("POST", "/api/intern/stellen", {
    firma: "Schmidt KG", titel: "Buchhaltung Teilzeit", richtung: "buero", berufe: [], plz: "70372", ort: "Stuttgart",
    kriterien: { arbeitszeit: { werte: ["Teilzeit"], gewicht: "muss" } }
  });
  assert.equal(st.status, 200, JSON.stringify(st.daten));
  assert.equal(st.daten.neueTreffer, 1, "nur die Teilzeit-Bewerberin passt");
  assert.equal(nach(URL_MATCHES).length, 1);

  /* Übergabe ohne hinterlegte Firmen-Kachel → klare Meldung */
  const d = await anfrage("GET", `/api/intern/stellen/${st.daten.id}`);
  const ue = await anfrage("POST", `/api/intern/treffer/${d.daten.treffer[0].id}`, { status: "uebergeben" });
  assert.equal(ue.status, 400);
  assert.match(ue.daten.fehler, /keine Lead-Table-Kachel der Firma/);
});

test("Steckbrief wird geprüft", async () => {
  const r = await anfrage("POST", "/api/intern/stellen", { firma: "", titel: "", richtung: "x", plz: "12" });
  assert.equal(r.status, 400);
  assert.match(r.daten.fehler, /Firma fehlt/);
  assert.match(r.daten.fehler, /PLZ/);
  const w = await anfrage("POST", "/api/intern/stellen", { ...stelleMueller, firmen_webhook: "http://unsicher" });
  assert.match(w.daten.fehler, /https/);
});

test("Lead Table ausgefallen: Treffer bleiben im Ausgang und gehen bei der Wartung raus", async () => {
  await einrichten();
  await anfrage("POST", "/api/intern/stellen", stelleMueller);
  leadTableKaputt = true;
  await anfrage("POST", "/api/bewerber", bewerber(), { passwort: "" });
  let u = await anfrage("GET", "/api/intern/uebersicht");
  assert.equal(u.daten.ausstehend, 1);
  assert.ok(u.daten.hinweise.letzterFehler);
  leadTableKaputt = false;
  await wartung(env);
  assert.equal(nach(URL_MATCHES).length, 1);
  assert.equal(nach(URL_POOL_ELEKTRO).length, 1, "Pool-Sendung wurde nachgeholt");
  u = await anfrage("GET", "/api/intern/uebersicht");
  assert.equal(u.daten.ausstehend, 0);
});

test("Löschen auf Anfrage und automatische Löschfrist", async () => {
  await einrichten();
  await anfrage("POST", "/api/intern/stellen", stelleMueller);
  await anfrage("POST", "/api/bewerber", bewerber(), { passwort: "" });
  await anfrage("POST", "/api/bewerber", bewerber({ vorname: "Alt", email: "alt@beispiel.de", telefon: "0170 9" }), { passwort: "" });

  const r = await anfrage("POST", "/api/intern/bewerber/loeschen", { suche: "max@beispiel.de" });
  assert.equal(r.daten.geloescht, 1);
  assert.equal(env.DB.roh.prepare("SELECT COUNT(*) AS n FROM matches m JOIN bewerber b ON b.id = m.bewerber_id WHERE b.email = 'max@beispiel.de'").get().n, 0);

  env.DB.roh.prepare("UPDATE bewerber SET aktualisiert = '2020-01-01T00:00:00.000Z' WHERE email = 'alt@beispiel.de'").run();
  await wartung(env);
  assert.equal(env.DB.roh.prepare("SELECT COUNT(*) AS n FROM bewerber").get().n, 0);
  assert.equal(env.DB.roh.prepare("SELECT COUNT(*) AS n FROM matches").get().n, 0);
});

test("Geänderter Steckbrief: unbearbeitete Treffer, die nicht mehr passen, verschwinden", async () => {
  await einrichten();
  const st = await anfrage("POST", "/api/intern/stellen", stelleMueller);
  await anfrage("POST", "/api/bewerber", bewerber(), { passwort: "" });
  let d = await anfrage("GET", `/api/intern/stellen/${st.daten.id}`);
  assert.equal(d.daten.treffer.length, 1);
  await anfrage("PUT", `/api/intern/stellen/${st.daten.id}`, { ...stelleMueller, kriterien: { ...stelleMueller.kriterien, arbeitszeit: { werte: ["3-Schicht"], gewicht: "muss" } } });
  d = await anfrage("GET", `/api/intern/stellen/${st.daten.id}`);
  assert.equal(d.daten.treffer.length, 0);
});
