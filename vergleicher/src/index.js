/* =====================================================================
   Vergleicher – Cloudflare Worker

   Öffentlich:
     POST /api/bewerber      Profil aus dem Portal annehmen → Pool der Lead
                             Table + Abgleich mit allen offenen Stellen
   Intern (Passwort = Secret ADMIN_TOKEN):
     GET  /intern            Oberfläche: Stellen, Stellen-Steckbrief,
                             Treffer, Übergabe, Einstellungen
     /api/intern/…           die Daten dazu
   Zeitgesteuert (alle 15 Min):
     Ausstehende Sendungen an die Lead Table nachschicken, alte Profile
     nach der Löschfrist entfernen.

   Die Lead Table ist das Ziel, nicht die Quelle: Alles, was verglichen
   wird, liegt in der eigenen Datenbank (D1). In die Lead Table gehen
   Kopien – Pool, Treffer („Matches“) und Übergaben an die Firmen.
   ===================================================================== */
import berufe from "../../config/berufe.json" with { type: "json" };
import felder from "../../schema/felder.json" with { type: "json" };
import { vergleiche, koordinaten, entfernungKm, gruendeText, passungText, ABSCHLUSS_MIN, DEUTSCH_MIN, START } from "./matching.js";
import internSeite from "./intern-seite.js";

const RICHTUNG = Object.fromEntries(berufe.map(b => [b.key, b]));
const optionen = (key) => (felder.find(f => f.key === key) || {}).optionen || [];
const STATUS_MATCH = ["neu", "angerufen", "uebergeben", "kein_interesse", "passt_nicht"];
const STATUS_STELLE = ["offen", "pausiert", "besetzt"];
const GEWICHTE = ["muss", "wunsch", "egal"];
/* Höchstens so viele Sendungen an die Lead Table pro Aufruf (Cloudflare begrenzt Unteranfragen). */
const MAX_SENDUNGEN = 25;

const jetzt = () => new Date().toISOString();
/* Ziel-Adressen müssen https sein. Nur für lokale Tests (LOKALE_ZIELE=1) auch http://localhost. */
const zielOk = (u, env) => /^https:\/\//.test(u) || (env.LOKALE_ZIELE === "1" && /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//.test(u));
const heute = () => new Date().toLocaleDateString("de-DE", { timeZone: "Europe/Berlin", day: "2-digit", month: "2-digit", year: "numeric" });

function antwort(daten, status = 200, kopf = {}) {
  return new Response(JSON.stringify(daten), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...kopf } });
}

/* ---------- Zugriff ---------- */
function cors(req, env) {
  const origin = req.headers.get("Origin");
  if (!origin) return {};
  const erlaubt = String(env.ERLAUBTE_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
  if (erlaubt.length && !erlaubt.includes(origin)) return {};
  return { "Access-Control-Allow-Origin": origin, "Vary": "Origin", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400" };
}

function angemeldet(req, env) {
  const soll = String(env.ADMIN_TOKEN || "");
  const ist = String(req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!soll || ist.length !== soll.length) return false;
  let unterschied = 0;
  for (let i = 0; i < soll.length; i++) unterschied |= soll.charCodeAt(i) ^ ist.charCodeAt(i);
  return unterschied === 0;
}

/* ---------- Einstellungen (in der Datenbank, über /intern pflegbar) ---------- */
const STANDARD = { pool_webhooks: {}, matches_webhook: "", loeschfrist_monate: 12, basis_url: "", letzter_fehler: null };

async function einstellungen(env) {
  const e = structuredClone(STANDARD);
  const { results } = await env.DB.prepare("SELECT schluessel, wert FROM einstellungen").all();
  for (const z of results || []) if (z.schluessel in e) e[z.schluessel] = JSON.parse(z.wert);
  return e;
}
async function setzeEinstellung(env, schluessel, wert) {
  await env.DB.prepare("INSERT INTO einstellungen (schluessel, wert) VALUES (?, ?) ON CONFLICT (schluessel) DO UPDATE SET wert = excluded.wert")
    .bind(schluessel, JSON.stringify(wert)).run();
}

/* ---------- Lead Table ---------- */
async function anLeadTable(env, url, daten, wofuer) {
  if (!url) return false;
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(daten) });
    if (res.ok) return true;
    await setzeEinstellung(env, "letzter_fehler", { zeit: jetzt(), wofuer, text: `Lead Table antwortet mit HTTP ${res.status}` });
  } catch (err) {
    await setzeEinstellung(env, "letzter_fehler", { zeit: jetzt(), wofuer, text: String(err && err.message || err) });
  }
  return false;
}

/* Was in der Kachel „Matches“ landet: genug, um sofort anrufen zu können. */
function matchPayload(b, s, m, basisUrl) {
  const d = b.daten;
  const unklar = m.gruende.filter(g => g.ok === null).map(g => g.text);
  return {
    vorname: d.vorname, nachname: d.nachname, telefon: d.telefon, email: d.email,
    firma: s.firma, stelle: s.titel, arbeitsort: [s.plz, s.ort].filter(Boolean).join(" "),
    entfernung: m.entfernung_km != null ? `${m.entfernung_km} km` : "unbekannt",
    passung: passungText({ punkte: m.punkte, maxPunkte: m.max_punkte }),
    pruefen: unklar.length ? unklar.join(" · ") : "–",
    gruende: gruendeText(m.gruende),
    richtung: (RICHTUNG[b.richtung] || {}).name || b.richtung,
    beruf: d.beruf, abschluss: d.abschluss, erfahrung: d.erfahrung, plz: d.plz, ort: d.ort,
    fahrweg: d.fahrweg, verfuegbarkeit: d.verfuegbarkeit, gehalt: d.gehalt, schicht: d.schicht,
    fuehrerschein: d.fuehrerschein, deutsch: d.deutsch, lebenslauf: d.lebenslauf,
    sperrliste: d.sperrliste || "–", erreichbarkeit: d.erreichbarkeit || "–",
    benefits: s.benefits || "–",
    bearbeiten: basisUrl ? `${basisUrl}/intern#stelle-${s.id}` : "–",
    datum: heute(), quelle: "Vergleicher"
  };
}

/* Was die Firma bei der Übergabe bekommt – ohne Sperrliste, Einwilligung und Herkunft. */
function uebergabePayload(b, s, notiz) {
  const d = b.daten;
  return {
    vorname: d.vorname, nachname: d.nachname, telefon: d.telefon, email: d.email,
    stelle: s.titel, beruf: d.beruf, abschluss: d.abschluss, erfahrung: d.erfahrung,
    wohnort: [d.plz, d.ort].filter(Boolean).join(" "), verfuegbarkeit: d.verfuegbarkeit,
    gehaltswunsch: d.gehalt, arbeitszeit: d.schicht, fuehrerschein: d.fuehrerschein, deutsch: d.deutsch,
    lebenslauf: d.lebenslauf, erreichbarkeit: d.erreichbarkeit || "–",
    notiz: notiz || "–", datum: heute(), quelle: "Telefonisch geprüft"
  };
}

/* ---------- Zeilen ↔ Objekte ---------- */
function stelleAus(z) {
  const d = JSON.parse(z.daten);
  return { ...d, id: z.id, status: z.status, firma: z.firma, titel: z.titel, richtung: z.richtung, plz: z.plz, lat: z.lat, lon: z.lon, erstellt: z.erstellt, aktualisiert: z.aktualisiert, alleBerufe: (RICHTUNG[z.richtung] || {}).berufe || [] };
}
function bewerberAus(z) {
  return { id: z.id, richtung: z.richtung, lat: z.lat, lon: z.lon, daten: JSON.parse(z.daten), erstellt: z.erstellt };
}
function matchAus(z) {
  return { ...z, gruende: JSON.parse(z.gruende) };
}

/* ---------- Abgleich ---------- */
/* Plant, was mit einem Paar Bewerber/Stelle passiert, und liefert die nötige SQL-Anweisung.
   Alle Anweisungen eines Abgleichs laufen danach gesammelt (batch) – so bleibt auch ein
   großer Pool unter den Grenzen von Cloudflare. */
function planeTreffer(env, b, s, erg, km, vorhanden) {
  const passt = erg.passt || erg.gesperrt;
  if (!passt) {
    /* Passt nicht (mehr): nur unbearbeitete Treffer verschwinden, alles andere bleibt dokumentiert. */
    if (vorhanden && (vorhanden.status === "neu" || vorhanden.status === "gesperrt")) return { stmt: env.DB.prepare("DELETE FROM matches WHERE id = ?").bind(vorhanden.id) };
    return {};
  }
  const gruende = JSON.stringify(erg.gruende);
  if (vorhanden) {
    return { stmt: env.DB.prepare("UPDATE matches SET punkte = ?, max_punkte = ?, entfernung_km = ?, gruende = ? WHERE id = ?")
      .bind(erg.punkte, erg.maxPunkte, km, gruende, vorhanden.id) };
  }
  const id = crypto.randomUUID();
  return {
    neu: erg.gesperrt ? null : id,
    stmt: env.DB.prepare("INSERT INTO matches (id, erstellt, bewerber_id, stelle_id, punkte, max_punkte, entfernung_km, gruende, status, lt_gesendet) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)")
      .bind(id, jetzt(), b.id, s.id, erg.punkte, erg.maxPunkte, km, gruende, erg.gesperrt ? "gesperrt" : "neu")
  };
}

async function ausfuehren(env, stmts) {
  for (let i = 0; i < stmts.length; i += 50) await env.DB.batch(stmts.slice(i, i + 50));
}

function abstand(b, s) {
  return b.lat != null && s.lat != null ? entfernungKm([b.lat, b.lon], [s.lat, s.lon]) : null;
}

/* Neuer oder geänderter Bewerber → alle offenen Stellen seiner Richtung */
async function abgleichBewerber(env, b) {
  const { results: stellen } = await env.DB.prepare("SELECT * FROM stellen WHERE richtung = ? AND status = 'offen'").bind(b.richtung).all();
  const { results: alt } = await env.DB.prepare("SELECT id, stelle_id, status FROM matches WHERE bewerber_id = ?").bind(b.id).all();
  const vorhanden = new Map((alt || []).map(z => [z.stelle_id, z]));
  const stmts = [], neu = [];
  for (const z of stellen || []) {
    const s = stelleAus(z), km = abstand(b, s);
    const plan = planeTreffer(env, b, s, vergleiche(b.daten, s, km), km, vorhanden.get(s.id));
    if (plan.stmt) stmts.push(plan.stmt);
    if (plan.neu) neu.push(plan.neu);
  }
  await ausfuehren(env, stmts);
  return neu;
}

/* Neue oder geänderte Stelle → der ganze Pool ihrer Richtung */
async function abgleichStelle(env, s) {
  if (s.status !== "offen") return [];
  const { results: pool } = await env.DB.prepare("SELECT * FROM bewerber WHERE richtung = ?").bind(s.richtung).all();
  const { results: alt } = await env.DB.prepare("SELECT id, bewerber_id, status FROM matches WHERE stelle_id = ?").bind(s.id).all();
  const vorhanden = new Map((alt || []).map(z => [z.bewerber_id, z]));
  const stmts = [], neu = [];
  for (const z of pool || []) {
    const b = bewerberAus(z), km = abstand(b, s);
    const plan = planeTreffer(env, b, s, vergleiche(b.daten, s, km), km, vorhanden.get(b.id));
    if (plan.stmt) stmts.push(plan.stmt);
    if (plan.neu) neu.push(plan.neu);
  }
  await ausfuehren(env, stmts);
  return neu;
}

/* Ausstehende Treffer an die Kachel „Matches“ schicken – beste zuerst, begrenzt pro Aufruf. */
async function ausgangSenden(env, e, max = MAX_SENDUNGEN) {
  if (!e.matches_webhook) return 0;
  const { results } = await env.DB.prepare(
    `SELECT m.*, b.daten AS b_daten, b.richtung AS b_richtung, s.daten AS s_daten, s.firma, s.titel, s.plz AS s_plz, s.richtung AS s_richtung, s.status AS s_status
     FROM matches m JOIN bewerber b ON b.id = m.bewerber_id JOIN stellen s ON s.id = m.stelle_id
     WHERE m.lt_gesendet = 0 AND m.status = 'neu' AND s.status = 'offen'
     ORDER BY m.punkte DESC, m.entfernung_km ASC LIMIT ?`).bind(max).all();
  let gesendet = 0;
  for (const z of results || []) {
    const b = { id: z.bewerber_id, richtung: z.b_richtung, daten: JSON.parse(z.b_daten) };
    const s = { ...JSON.parse(z.s_daten), id: z.stelle_id, firma: z.firma, titel: z.titel, plz: z.s_plz };
    const ok = await anLeadTable(env, e.matches_webhook, matchPayload(b, s, matchAus(z), e.basis_url), "Treffer an Kachel „Matches“");
    if (!ok) break;
    await env.DB.prepare("UPDATE matches SET lt_gesendet = 1 WHERE id = ?").bind(z.id).run();
    gesendet++;
  }
  return gesendet;
}

/* Bewerber, deren Pool-Sendung fehlgeschlagen ist, nachschicken. */
async function poolNachsenden(env, e, max = 10) {
  const { results } = await env.DB.prepare("SELECT id, richtung, daten FROM bewerber WHERE lt_gesendet = 0 LIMIT ?").bind(max).all();
  for (const z of results || []) {
    const url = e.pool_webhooks[z.richtung] || e.pool_webhooks.fallback;
    if (!url) continue;
    if (!(await anLeadTable(env, url, JSON.parse(z.daten), "Bewerber an Pool-Kachel"))) break;
    await env.DB.prepare("UPDATE bewerber SET lt_gesendet = 1 WHERE id = ?").bind(z.id).run();
  }
}

/* ---------- Öffentlich: Bewerber annehmen ---------- */
const BEWERBER_FELDER = ["vorname", "nachname", "telefon", "email", "richtung", "berufskategorie", "beruf", "abschluss", "erfahrung", "plz", "ort", "fahrweg", "verfuegbarkeit", "gehalt", "schicht", "fuehrerschein", "deutsch", "lebenslauf", "sperrliste", "erreichbarkeit", "einwilligung", "datum", "quelle", "seite", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

async function bewerberAnnehmen(req, env) {
  const kopf = cors(req, env);
  let p;
  try { p = JSON.parse(await req.text()); } catch { return antwort({ ok: false, fehler: "Ungültige Daten" }, 400, kopf); }
  if (!p || typeof p !== "object") return antwort({ ok: false, fehler: "Ungültige Daten" }, 400, kopf);
  if (p.firma_website) return antwort({ ok: true }, 200, kopf);   /* Honeypot: still beenden */

  const daten = {};
  for (const k of BEWERBER_FELDER) if (p[k] != null && p[k] !== "") daten[k] = String(p[k]).slice(0, k === "sperrliste" ? 400 : 300);
  for (const k of ["vorname", "nachname", "telefon", "email", "richtung", "plz"]) {
    if (!daten[k]) return antwort({ ok: false, fehler: `Feld „${k}“ fehlt` }, 400, kopf);
  }
  if (!RICHTUNG[daten.richtung]) return antwort({ ok: false, fehler: "Unbekannte Richtung" }, 400, kopf);
  if (!/^\d{5}$/.test(daten.plz)) return antwort({ ok: false, fehler: "Ungültige PLZ" }, 400, kopf);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(daten.email)) return antwort({ ok: false, fehler: "Ungültige E-Mail" }, 400, kopf);

  const email = daten.email.toLowerCase(), telefon = daten.telefon.replace(/\D/g, "");
  const ko = koordinaten(daten.plz);
  const vorhanden = await env.DB.prepare("SELECT id FROM bewerber WHERE email = ? OR (telefon = ? AND telefon <> '') LIMIT 1").bind(email, telefon).first();
  const id = vorhanden ? vorhanden.id : crypto.randomUUID();
  if (vorhanden) {
    /* Wer sich erneut meldet, aktualisiert sein Profil statt einen zweiten Eintrag anzulegen. */
    await env.DB.prepare("UPDATE bewerber SET aktualisiert = ?, richtung = ?, email = ?, telefon = ?, plz = ?, lat = ?, lon = ?, daten = ?, lt_gesendet = 0 WHERE id = ?")
      .bind(jetzt(), daten.richtung, email, telefon, daten.plz, ko ? ko[0] : null, ko ? ko[1] : null, JSON.stringify(daten), id).run();
  } else {
    await env.DB.prepare("INSERT INTO bewerber (id, erstellt, aktualisiert, richtung, email, telefon, plz, lat, lon, daten, lt_gesendet) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)")
      .bind(id, jetzt(), jetzt(), daten.richtung, email, telefon, daten.plz, ko ? ko[0] : null, ko ? ko[1] : null, JSON.stringify(daten)).run();
  }

  const e = await einstellungen(env);
  const poolUrl = e.pool_webhooks[daten.richtung] || e.pool_webhooks.fallback;
  if (await anLeadTable(env, poolUrl, daten, "Bewerber an Pool-Kachel")) {
    await env.DB.prepare("UPDATE bewerber SET lt_gesendet = 1 WHERE id = ?").bind(id).run();
  }
  const b = { id, richtung: daten.richtung, lat: ko ? ko[0] : null, lon: ko ? ko[1] : null, daten };
  await abgleichBewerber(env, b);
  await ausgangSenden(env, e);
  return antwort({ ok: true }, 200, kopf);
}

/* ---------- Intern: Stellen-Steckbrief prüfen und speichern ---------- */
function steckbriefPruefen(p, env) {
  const fehler = [];
  const s = {
    firma: String(p.firma || "").trim().slice(0, 120),
    ansprechpartner: String(p.ansprechpartner || "").slice(0, 120),
    telefon: String(p.telefon || "").slice(0, 60),
    email: String(p.email || "").slice(0, 120),
    firmen_webhook: String(p.firmen_webhook || "").trim().slice(0, 1000),
    titel: String(p.titel || "").trim().slice(0, 120),
    richtung: String(p.richtung || ""),
    berufe: [],
    anzahl: Math.max(1, Math.min(99, parseInt(p.anzahl, 10) || 1)),
    start: Object.keys(START).includes(p.start) ? p.start : "Flexibel",
    plz: String(p.plz || "").trim(),
    ort: String(p.ort || "").trim().slice(0, 80),
    umkreis: [10, 20, 30, 50, 75, 100].includes(Number(p.umkreis)) ? Number(p.umkreis) : null,
    benefits: String(p.benefits || "").slice(0, 600),
    lebenslauf_noetig: !!p.lebenslauf_noetig,
    notizen: String(p.notizen || "").slice(0, 1000),
    kriterien: {}
  };
  if (!s.firma) fehler.push("Firma fehlt");
  if (!s.titel) fehler.push("Stellenbezeichnung fehlt");
  if (!RICHTUNG[s.richtung]) fehler.push("Richtung fehlt");
  if (!/^\d{5}$/.test(s.plz)) fehler.push("PLZ des Arbeitsorts fehlt oder hat nicht fünf Ziffern");
  if (s.firmen_webhook && !zielOk(s.firmen_webhook, env)) fehler.push("Webhook der Firmen-Kachel muss mit https:// beginnen");
  if (RICHTUNG[s.richtung]) s.berufe = (Array.isArray(p.berufe) ? p.berufe : []).filter(x => RICHTUNG[s.richtung].berufe.includes(x));

  const k = p.kriterien || {};
  const g = (x, standard) => GEWICHTE.includes(x) ? x : standard;
  s.kriterien.beruf = { gewicht: g(k.beruf?.gewicht, "muss") };
  s.kriterien.start = { gewicht: g(k.start?.gewicht, "wunsch") };
  s.kriterien.abschluss = { wert: ["egal", ...Object.keys(ABSCHLUSS_MIN)].includes(k.abschluss?.wert) ? k.abschluss.wert : "egal", gewicht: g(k.abschluss?.gewicht, "muss") };
  s.kriterien.erfahrung = { wert: [0, 1, 3, 5, 10].includes(Number(k.erfahrung?.wert)) ? Number(k.erfahrung.wert) : 0, gewicht: g(k.erfahrung?.gewicht, "wunsch") };
  const von = Math.max(0, parseInt(k.gehalt?.von, 10) || 0), bis = Math.max(0, parseInt(k.gehalt?.bis, 10) || 0);
  s.kriterien.gehalt = { von, bis, gewicht: g(k.gehalt?.gewicht, "muss") };
  if (bis && von > bis) fehler.push("Gehalt: „von“ ist größer als „bis“");
  s.kriterien.arbeitszeit = { werte: (k.arbeitszeit?.werte || []).filter(x => optionen("schicht").includes(x)), gewicht: g(k.arbeitszeit?.gewicht, "muss") };
  s.kriterien.fuehrerschein = { werte: (k.fuehrerschein?.werte || []).filter(x => optionen("fuehrerschein").includes(x) && x !== "Keinen"), gewicht: g(k.fuehrerschein?.gewicht, "muss") };
  s.kriterien.deutsch = { wert: ["egal", ...Object.keys(DEUTSCH_MIN)].includes(k.deutsch?.wert) ? k.deutsch.wert : "egal", gewicht: g(k.deutsch?.gewicht, "muss") };
  return { s, fehler };
}

async function stelleSpeichern(env, p, id) {
  const { s, fehler } = steckbriefPruefen(p, env);
  if (fehler.length) return antwort({ ok: false, fehler: fehler.join(" · ") }, 400);
  const ko = koordinaten(s.plz);
  if (id) {
    const alt = await env.DB.prepare("SELECT id, status FROM stellen WHERE id = ?").bind(id).first();
    if (!alt) return antwort({ ok: false, fehler: "Stelle nicht gefunden" }, 404);
    await env.DB.prepare("UPDATE stellen SET aktualisiert = ?, firma = ?, titel = ?, richtung = ?, plz = ?, lat = ?, lon = ?, daten = ? WHERE id = ?")
      .bind(jetzt(), s.firma, s.titel, s.richtung, s.plz, ko ? ko[0] : null, ko ? ko[1] : null, JSON.stringify(s), id).run();
  } else {
    id = crypto.randomUUID();
    await env.DB.prepare("INSERT INTO stellen (id, erstellt, aktualisiert, status, firma, titel, richtung, plz, lat, lon, daten) VALUES (?, ?, ?, 'offen', ?, ?, ?, ?, ?, ?, ?)")
      .bind(id, jetzt(), jetzt(), s.firma, s.titel, s.richtung, s.plz, ko ? ko[0] : null, ko ? ko[1] : null, JSON.stringify(s)).run();
  }
  const z = await env.DB.prepare("SELECT * FROM stellen WHERE id = ?").bind(id).first();
  const neu = await abgleichStelle(env, stelleAus(z));
  const e = await einstellungen(env);
  const gesendet = await ausgangSenden(env, e);
  return antwort({ ok: true, id, neueTreffer: neu.length, anLeadTable: gesendet, plzBekannt: !!ko });
}

/* ---------- Intern: Routen ---------- */
async function intern(req, env, pfad, url) {
  const e = await einstellungen(env);
  if (e.basis_url !== url.origin) await setzeEinstellung(env, "basis_url", url.origin);
  const body = req.method === "GET" ? null : await req.json().catch(() => ({}));
  let m;

  if (pfad === "/api/intern/konfig" && req.method === "GET") {
    return antwort({
      richtungen: berufe.map(({ key, name, berufe }) => ({ key, name, berufe })),
      arbeitszeit: optionen("schicht"),
      fuehrerschein: optionen("fuehrerschein").filter(x => x !== "Keinen"),
      abschluss: Object.keys(ABSCHLUSS_MIN), deutsch: Object.keys(DEUTSCH_MIN), start: Object.keys(START)
    });
  }

  if (pfad === "/api/intern/uebersicht" && req.method === "GET") {
    const { results: stellen } = await env.DB.prepare(
      `SELECT s.id, s.firma, s.titel, s.richtung, s.plz, s.status, s.aktualisiert, s.daten,
        (SELECT COUNT(*) FROM matches m WHERE m.stelle_id = s.id AND m.status = 'neu') AS neu,
        (SELECT COUNT(*) FROM matches m WHERE m.stelle_id = s.id AND m.status NOT IN ('gesperrt', 'passt_nicht', 'kein_interesse')) AS aktiv,
        (SELECT COUNT(*) FROM matches m WHERE m.stelle_id = s.id AND m.status = 'uebergeben') AS uebergeben
       FROM stellen s ORDER BY CASE s.status WHEN 'offen' THEN 0 WHEN 'pausiert' THEN 1 ELSE 2 END, s.aktualisiert DESC`).all();
    const { results: pool } = await env.DB.prepare("SELECT richtung, COUNT(*) AS anzahl FROM bewerber GROUP BY richtung").all();
    const ausstehend = await env.DB.prepare("SELECT COUNT(*) AS n FROM matches m JOIN stellen s ON s.id = m.stelle_id WHERE m.lt_gesendet = 0 AND m.status = 'neu' AND s.status = 'offen'").first();
    return antwort({
      stellen: (stellen || []).map(z => ({ id: z.id, firma: z.firma, titel: z.titel, richtung: z.richtung, ort: [z.plz, JSON.parse(z.daten).ort].filter(Boolean).join(" "), status: z.status, neu: z.neu, aktiv: z.aktiv, uebergeben: z.uebergeben })),
      pool: Object.fromEntries((pool || []).map(z => [z.richtung, z.anzahl])),
      ausstehend: ausstehend ? ausstehend.n : 0,
      hinweise: {
        matchesKachelFehlt: !e.matches_webhook,
        poolKachelFehlt: !e.pool_webhooks.fallback && !Object.values(e.pool_webhooks).some(Boolean),
        letzterFehler: e.letzter_fehler
      }
    });
  }

  if (pfad === "/api/intern/stellen" && req.method === "POST") return stelleSpeichern(env, body);

  if ((m = pfad.match(/^\/api\/intern\/stellen\/([\w-]+)$/))) {
    if (req.method === "PUT") return stelleSpeichern(env, body, m[1]);
    if (req.method === "GET") {
      const z = await env.DB.prepare("SELECT * FROM stellen WHERE id = ?").bind(m[1]).first();
      if (!z) return antwort({ fehler: "Stelle nicht gefunden" }, 404);
      const { results } = await env.DB.prepare(
        `SELECT m.*, b.daten AS b_daten FROM matches m JOIN bewerber b ON b.id = m.bewerber_id WHERE m.stelle_id = ?
         ORDER BY CASE m.status WHEN 'gesperrt' THEN 2 WHEN 'passt_nicht' THEN 1 WHEN 'kein_interesse' THEN 1 ELSE 0 END, m.punkte DESC, m.entfernung_km ASC`).bind(m[1]).all();
      const stelle = stelleAus(z);
      delete stelle.alleBerufe;
      return antwort({ stelle, treffer: (results || []).map(t => ({ ...matchAus(t), b_daten: undefined, bewerber: JSON.parse(t.b_daten) })) });
    }
  }

  if ((m = pfad.match(/^\/api\/intern\/stellen\/([\w-]+)\/status$/)) && req.method === "POST") {
    if (!STATUS_STELLE.includes(body.status)) return antwort({ ok: false, fehler: "Unbekannter Status" }, 400);
    await env.DB.prepare("UPDATE stellen SET status = ?, aktualisiert = ? WHERE id = ?").bind(body.status, jetzt(), m[1]).run();
    let neu = [];
    if (body.status === "offen") {
      const z = await env.DB.prepare("SELECT * FROM stellen WHERE id = ?").bind(m[1]).first();
      if (z) { neu = await abgleichStelle(env, stelleAus(z)); await ausgangSenden(env, e); }
    }
    return antwort({ ok: true, neueTreffer: neu.length });
  }

  if ((m = pfad.match(/^\/api\/intern\/treffer\/([\w-]+)$/)) && req.method === "POST") {
    const t = await env.DB.prepare("SELECT * FROM matches WHERE id = ?").bind(m[1]).first();
    if (!t) return antwort({ ok: false, fehler: "Treffer nicht gefunden" }, 404);
    if (!STATUS_MATCH.includes(body.status)) return antwort({ ok: false, fehler: "Unbekannter Status" }, 400);
    const notiz = String(body.notiz || "").slice(0, 1000);
    if (body.status === "uebergeben" && t.status !== "uebergeben") {
      const sz = await env.DB.prepare("SELECT * FROM stellen WHERE id = ?").bind(t.stelle_id).first();
      const bz = await env.DB.prepare("SELECT * FROM bewerber WHERE id = ?").bind(t.bewerber_id).first();
      if (!sz || !bz) return antwort({ ok: false, fehler: "Stelle oder Bewerber gibt es nicht mehr" }, 404);
      const s = stelleAus(sz);
      if (!s.firmen_webhook) return antwort({ ok: false, fehler: "Für diese Stelle ist keine Lead-Table-Kachel der Firma hinterlegt. Im Steckbrief unter „Firma“ eintragen." }, 400);
      const ok = await anLeadTable(env, s.firmen_webhook, uebergabePayload(bewerberAus(bz), s, notiz), `Übergabe an ${s.firma}`);
      if (!ok) return antwort({ ok: false, fehler: "Die Lead Table der Firma hat die Übergabe nicht angenommen. Bitte später noch mal versuchen." }, 502);
    }
    await env.DB.prepare("UPDATE matches SET status = ?, notiz = ? WHERE id = ?").bind(body.status, notiz, m[1]).run();
    return antwort({ ok: true });
  }

  if (pfad === "/api/intern/einstellungen") {
    if (req.method === "GET") return antwort({ pool_webhooks: e.pool_webhooks, matches_webhook: e.matches_webhook, loeschfrist_monate: e.loeschfrist_monate, richtungen: berufe.map(({ key, name }) => ({ key, name })) });
    if (req.method === "PUT") {
      const pool = {};
      for (const k of ["fallback", ...berufe.map(b => b.key)]) {
        const u = String((body.pool_webhooks || {})[k] || "").trim();
        if (u && !zielOk(u, env)) return antwort({ ok: false, fehler: `Pool-Kachel „${k}“: Die Adresse muss mit https:// beginnen` }, 400);
        if (u) pool[k] = u;
      }
      const mw = String(body.matches_webhook || "").trim();
      if (mw && !zielOk(mw, env)) return antwort({ ok: false, fehler: "Kachel „Matches“: Die Adresse muss mit https:// beginnen" }, 400);
      const frist = Math.max(1, Math.min(60, parseInt(body.loeschfrist_monate, 10) || 12));
      await setzeEinstellung(env, "pool_webhooks", pool);
      await setzeEinstellung(env, "matches_webhook", mw);
      await setzeEinstellung(env, "loeschfrist_monate", frist);
      await setzeEinstellung(env, "letzter_fehler", null);
      const gesendet = await ausgangSenden(env, await einstellungen(env));
      return antwort({ ok: true, nachgesendet: gesendet });
    }
  }

  if (pfad === "/api/intern/bewerber/loeschen" && req.method === "POST") {
    const suche = String(body.suche || "").trim().toLowerCase();
    if (suche.length < 5) return antwort({ ok: false, fehler: "Bitte E-Mail oder Telefonnummer eingeben" }, 400);
    const tel = suche.replace(/\D/g, "");
    const { results } = await env.DB.prepare("SELECT id FROM bewerber WHERE email = ? OR (? <> '' AND telefon = ?)").bind(suche, tel, tel).all();
    for (const z of results || []) {
      await env.DB.prepare("DELETE FROM matches WHERE bewerber_id = ?").bind(z.id).run();
      await env.DB.prepare("DELETE FROM bewerber WHERE id = ?").bind(z.id).run();
    }
    return antwort({ ok: true, geloescht: (results || []).length });
  }

  return antwort({ fehler: "Nicht gefunden" }, 404);
}

/* ---------- Wartung (Cron) ---------- */
export async function wartung(env) {
  const e = await einstellungen(env);
  await poolNachsenden(env, e);
  await ausgangSenden(env, e);
  /* Löschfrist: Profile ohne Aktualisierung seit X Monaten verschwinden samt Treffern. */
  const grenze = new Date();
  grenze.setMonth(grenze.getMonth() - (Number(e.loeschfrist_monate) || 12));
  const g = grenze.toISOString();
  await env.DB.prepare("DELETE FROM matches WHERE bewerber_id IN (SELECT id FROM bewerber WHERE aktualisiert < ?)").bind(g).run();
  await env.DB.prepare("DELETE FROM bewerber WHERE aktualisiert < ?").bind(g).run();
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const pfad = url.pathname.replace(/\/+$/, "") || "/";
    try {
      if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req, env) });
      if (pfad === "/") return Response.redirect(`${url.origin}/intern`, 302);
      if (pfad === "/intern") {
        return new Response(internSeite, { headers: {
          "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow",
          "x-frame-options": "DENY", "referrer-policy": "no-referrer"
        } });
      }
      if (pfad === "/api/ping") return antwort({ ok: true });
      if (pfad === "/api/bewerber" && req.method === "POST") return await bewerberAnnehmen(req, env);
      if (pfad.startsWith("/api/intern/")) {
        if (!env.ADMIN_TOKEN) return antwort({ fehler: "Das Passwort (Secret ADMIN_TOKEN) ist noch nicht gesetzt." }, 503);
        if (!angemeldet(req, env)) return antwort({ fehler: "Nicht angemeldet" }, 401);
        return await intern(req, env, pfad, url);
      }
      return antwort({ fehler: "Nicht gefunden" }, 404);
    } catch (err) {
      return antwort({ ok: false, fehler: "Interner Fehler", detail: String(err && err.message || err) }, 500, cors(req, env));
    }
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(wartung(env));
  }
};
