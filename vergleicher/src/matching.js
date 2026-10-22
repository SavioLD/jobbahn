/* =====================================================================
   Vergleichsregeln: passt ein Bewerber zu einer Stelle?

   Muss-Kriterien filtern. Wunsch-Kriterien geben Punkte. Ein Mensch
   entscheidet – das Ergebnis ist ein Vorschlag mit Begründung, keine
   Bewertung des Bewerbers. Regeln im Detail: ../../MATCHING.md
   Reine Funktionen ohne Datenbank, damit sie einzeln testbar sind.
   ===================================================================== */
import plzDaten from "../daten/plz-de.json" with { type: "json" };

/* ---------- Ränge der Antworten (aus schema/felder.json) ---------- */
const ABSCHLUSS = {
  "Noch in Ausbildung": 0,
  "Kein Abschluss, aber Berufserfahrung": 1,
  "Abgeschlossene Ausbildung": 2,
  "Meister": 3,
  "Techniker": 3,
  "Studium": 3
};
/* Was die Firma mindestens verlangt → nötiger Rang */
export const ABSCHLUSS_MIN = { "Abgeschlossene Ausbildung": 2, "Meister oder Techniker": 3, "Studium": 3 };

const ERFAHRUNG = { "Unter 1 Jahr": 0, "1 bis 3 Jahre": 1, "3 bis 5 Jahre": 3, "5 bis 10 Jahre": 5, "Über 10 Jahre": 10 };

const DEUTSCH = { "Grundkenntnisse": 0, "Gut – im Alltag kein Problem": 1, "Sehr gut": 2, "Muttersprache": 3 };
export const DEUTSCH_MIN = { "Grundkenntnisse": 0, "Gut": 1, "Sehr gut": 2, "Muttersprache": 3 };

const FAHRWEG = { "Bis 10 km": 10, "Bis 20 km": 20, "Bis 30 km": 30, "Bis 50 km": 50, "Egal, wenn der Job passt": Infinity };

const GEHALT = {
  "Bis 2.800 €": [0, 2800],
  "2.800 bis 3.300 €": [2800, 3300],
  "3.300 bis 3.800 €": [3300, 3800],
  "3.800 bis 4.300 €": [3800, 4300],
  "Über 4.300 €": [4300, Infinity]
};

/* Verfügbarkeit in Monaten bis zum Start */
const VERFUEGBAR = { "Sofort": 0, "In 1 Monat": 1, "In 2 bis 3 Monaten": 3, "Später als 3 Monate": 6 };
export const START = { "Sofort": 0, "In 1 Monat": 1, "In 2 bis 3 Monaten": 3, "Flexibel": Infinity };

/* Arbeitszeit der Stelle → welche Bewerber-Antworten sie abdecken */
const ARBEITSZEIT = {
  "Vollzeit tagsüber": ["Vollzeit tagsüber", "2-Schicht", "3-Schicht"],
  "Teilzeit": ["Teilzeit"],
  "2-Schicht": ["2-Schicht", "3-Schicht"],
  "3-Schicht": ["3-Schicht"],
  "Wochenende okay": ["Wochenende okay"],
  "Montage / auswärts okay": ["Montage / auswärts okay"]
};

const liste = (s) => String(s || "").split(",").map(x => x.trim()).filter(x => x && x !== "–");

/* ---------- Entfernung ---------- */
/* Koordinaten einer PLZ. Unbekannte (neue) PLZ: Mittel der PLZ mit gleichem Anfang. */
export function koordinaten(plz) {
  plz = String(plz || "").trim();
  if (!/^\d{5}$/.test(plz)) return null;
  if (plzDaten[plz]) return plzDaten[plz];
  for (const n of [4, 3]) {
    const treffer = Object.keys(plzDaten).filter(k => k.startsWith(plz.slice(0, n)));
    if (treffer.length) {
      const lat = treffer.reduce((s, k) => s + plzDaten[k][0], 0) / treffer.length;
      const lon = treffer.reduce((s, k) => s + plzDaten[k][1], 0) / treffer.length;
      return [lat, lon];
    }
  }
  return null;
}

/* Geschätzte Fahrstrecke in km: Luftlinie × 1,3 (übliche Faustregel für Straßen). */
export function entfernungKm(a, b) {
  if (!a || !b) return null;
  const rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(b[0] - a[0]), dLon = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLon / 2) ** 2;
  const luft = 2 * 6371 * Math.asin(Math.sqrt(h));
  return Math.round(luft * 1.3);
}

/* ---------- Sperrliste ---------- */
const RECHTSFORMEN = new Set(["gmbh", "mbh", "co", "kg", "ag", "ug", "ohg", "gbr", "ek", "e", "k", "haftungsbeschraenkt", "und", "the"]);
function woerter(s) {
  return String(s || "").toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, " ").split(" ")
    .filter(w => w.length >= 3 && !RECHTSFORMEN.has(w));
}
/* Gesperrt, wenn ein markantes Wort des Firmennamens (≥ 4 Zeichen) in der Sperrliste steht.
   Lieber einmal zu viel sperren als einen Bewerber beim eigenen Chef vorstellen. */
export function aufSperrliste(firma, sperrliste) {
  const gesperrt = new Set(woerter(sperrliste));
  if (!gesperrt.size) return false;
  return woerter(firma).some(w => w.length >= 4 && gesperrt.has(w));
}

/* ---------- Der Vergleich ---------- */
/**
 * @param {object} b  Bewerber-Daten (flacher Payload aus dem Portal)
 * @param {object} s  Stellen-Daten (Steckbrief)
 * @param {number|null} km  geschätzte Entfernung Wohnort → Arbeitsort
 * @returns {{passt:boolean, gesperrt:boolean, punkte:number, maxPunkte:number, gruende:Array}}
 */
export function vergleiche(b, s, km) {
  const gruende = [];
  let passt = true, punkte = 0, maxPunkte = 0;
  const k = s.kriterien || {};

  /* ok: true = erfüllt, false = nicht erfüllt, null = unklar (Talent Scout prüft) */
  function regel(feld, gewicht, ok, text) {
    if (!gewicht || gewicht === "egal") return;
    gruende.push({ feld, gewicht, ok, text });
    if (gewicht === "muss" && ok === false) passt = false;
    if (gewicht === "wunsch") { maxPunkte++; if (ok === true) punkte++; }
  }

  /* Sperrliste schlägt alles */
  if (aufSperrliste(s.firma, b.sperrliste)) {
    return { passt: false, gesperrt: true, punkte: 0, maxPunkte: 0, gruende: [{ feld: "sperrliste", gewicht: "muss", ok: false, text: `Steht auf der Sperrliste des Bewerbers („${b.sperrliste}“)` }] };
  }

  /* Entfernung: Grenze des Bewerbers und ggf. Umkreis der Firma */
  const grenzeBewerber = FAHRWEG[b.fahrweg] ?? Infinity;
  const grenzeFirma = Number(s.umkreis) > 0 ? Number(s.umkreis) : Infinity;
  const grenze = Math.min(grenzeBewerber, grenzeFirma);
  if (km == null) regel("entfernung", "muss", null, "Entfernung unbekannt – PLZ prüfen");
  else regel("entfernung", "muss", km <= grenze, km <= grenze
    ? `${km} km Fahrweg${grenze < Infinity ? ` (Grenze ${grenze} km)` : ""}`
    : `${km} km Fahrweg – zu weit (Grenze ${grenze} km)`);

  /* Beruf: leer = jeder Beruf der Richtung */
  const berufe = s.berufe || [];
  if (berufe.length) {
    const gewicht = k.beruf?.gewicht || "muss";
    if (berufe.includes(b.beruf)) regel("beruf", gewicht, true, `Beruf: ${b.beruf}`);
    else if (b.beruf && !(s.alleBerufe || []).includes(b.beruf)) regel("beruf", gewicht, null, `Beruf prüfen: „${b.beruf}“ (eigene Angabe)`);
    else regel("beruf", gewicht, false, `Beruf: ${b.beruf || "–"} (gesucht: ${berufe.join(", ")})`);
  }

  /* Abschluss */
  if (k.abschluss?.wert && k.abschluss.wert !== "egal") {
    const noetig = ABSCHLUSS_MIN[k.abschluss.wert] ?? 0;
    const hat = ABSCHLUSS[b.abschluss];
    const ok = hat == null ? null : k.abschluss.wert === "Studium" ? b.abschluss === "Studium" : hat >= noetig;
    regel("abschluss", k.abschluss.gewicht, ok, `Abschluss: ${b.abschluss || "–"} (verlangt: ${k.abschluss.wert})`);
  }

  /* Erfahrung */
  if (Number(k.erfahrung?.wert) > 0) {
    const hat = ERFAHRUNG[b.erfahrung];
    regel("erfahrung", k.erfahrung.gewicht, hat == null ? null : hat >= Number(k.erfahrung.wert),
      `Erfahrung: ${b.erfahrung || "–"} (verlangt: ab ${k.erfahrung.wert} Jahren)`);
  }

  /* Gehalt: Untergrenze des Wunsches darf den Rahmen der Firma nicht übersteigen */
  if (Number(k.gehalt?.bis) > 0) {
    const spanne = GEHALT[b.gehalt];
    const rahmen = `${Number(k.gehalt.von) > 0 ? `${k.gehalt.von}–` : "bis "}${k.gehalt.bis} €`;
    if (!spanne) regel("gehalt", k.gehalt.gewicht, null, `Gehalt am Telefon klären (Rahmen ${rahmen})`);
    else regel("gehalt", k.gehalt.gewicht, spanne[0] <= Number(k.gehalt.bis), `Gehaltswunsch ${b.gehalt} (Rahmen ${rahmen})`);
  }

  /* Arbeitszeit: jede Vorgabe der Stelle muss abgedeckt sein */
  const zeiten = k.arbeitszeit?.werte || [];
  if (zeiten.length) {
    const hat = liste(b.schicht);
    const fehlt = zeiten.filter(z => !(ARBEITSZEIT[z] || [z]).some(x => hat.includes(x)));
    regel("arbeitszeit", k.arbeitszeit.gewicht, hat.length ? !fehlt.length : null,
      fehlt.length ? `Arbeitszeit: ${fehlt.join(", ")} passt nicht (Bewerber: ${hat.join(", ") || "–"})` : `Arbeitszeit: ${zeiten.join(", ")}`);
  }

  /* Führerschein */
  const scheine = (k.fuehrerschein?.werte || []).filter(x => x !== "Keinen");
  if (scheine.length) {
    const hat = liste(b.fuehrerschein);
    const fehlt = scheine.filter(x => !hat.includes(x));
    regel("fuehrerschein", k.fuehrerschein.gewicht, !fehlt.length,
      fehlt.length ? `Führerschein fehlt: ${fehlt.join(", ")}` : `Führerschein: ${scheine.join(", ")}`);
  }

  /* Deutsch */
  if (k.deutsch?.wert && k.deutsch.wert !== "egal") {
    const hat = DEUTSCH[b.deutsch];
    regel("deutsch", k.deutsch.gewicht, hat == null ? null : hat >= (DEUTSCH_MIN[k.deutsch.wert] ?? 0),
      `Deutsch: ${b.deutsch || "–"} (verlangt: ${k.deutsch.wert})`);
  }

  /* Start */
  if (s.start && s.start !== "Flexibel" && k.start?.gewicht && k.start.gewicht !== "egal") {
    const kann = VERFUEGBAR[b.verfuegbarkeit];
    regel("start", k.start.gewicht, kann == null ? null : kann <= (START[s.start] ?? Infinity),
      `Start: ${b.verfuegbarkeit || "–"} (gewünscht: ${s.start})`);
  }

  return { passt, gesperrt: false, punkte, maxPunkte, gruende };
}

/* Kurzfassung für die Lead Table */
export function gruendeText(gruende) {
  return gruende.map(g => `${g.ok === true ? "✓" : g.ok === false ? "✗" : "?"} ${g.text}${g.gewicht === "wunsch" ? " (Wunsch)" : ""}`).join(" · ");
}
export function passungText(m) {
  return m.maxPunkte ? `${m.punkte} von ${m.maxPunkte} Wünschen` : "alle Muss-Kriterien erfüllt";
}
