/* Vergleichsregeln einzeln: node --test test/ */
import { test } from "node:test";
import assert from "node:assert/strict";
import { vergleiche, koordinaten, entfernungKm, aufSperrliste, gruendeText } from "../src/matching.js";

const bewerber = (x = {}) => ({
  beruf: "Mechatroniker", abschluss: "Abgeschlossene Ausbildung", erfahrung: "3 bis 5 Jahre",
  plz: "70173", fahrweg: "Bis 30 km", verfuegbarkeit: "In 1 Monat", gehalt: "3.300 bis 3.800 €",
  schicht: "Vollzeit tagsüber, 2-Schicht", fuehrerschein: "Klasse B", deutsch: "Sehr gut", sperrliste: "–", ...x
});
const stelle = (x = {}, k = {}) => ({
  firma: "Müller Elektrotechnik GmbH", titel: "Mechatroniker", richtung: "elektro", berufe: [], alleBerufe: ["Mechatroniker", "Servicetechniker"],
  start: "Flexibel", umkreis: null, ...x,
  kriterien: { beruf: { gewicht: "muss" }, start: { gewicht: "wunsch" }, abschluss: { wert: "egal", gewicht: "muss" }, erfahrung: { wert: 0, gewicht: "wunsch" },
    gehalt: { von: 0, bis: 0, gewicht: "muss" }, arbeitszeit: { werte: [], gewicht: "muss" }, fuehrerschein: { werte: [], gewicht: "muss" }, deutsch: { wert: "egal", gewicht: "muss" }, ...k }
});

test("Entfernung: Stuttgart → Böblingen ist nah, Stuttgart → Hamburg weit", () => {
  const stgt = koordinaten("70173"), bb = koordinaten("71032"), hh = koordinaten("20095");
  assert.ok(stgt && bb && hh);
  const nah = entfernungKm(stgt, bb), weit = entfernungKm(stgt, hh);
  assert.ok(nah > 10 && nah < 35, `Stuttgart–Böblingen ${nah} km`);
  assert.ok(weit > 600 && weit < 1000, `Stuttgart–Hamburg ${weit} km`);
});

test("Unbekannte PLZ fällt auf PLZ mit gleichem Anfang zurück, Unsinn ergibt null", () => {
  assert.ok(koordinaten("70199"));
  assert.equal(koordinaten("abc"), null);
  assert.equal(koordinaten(""), null);
});

test("Ohne Vorgaben passt jeder aus der Nähe", () => {
  const e = vergleiche(bewerber(), stelle(), 22);
  assert.equal(e.passt, true);
  assert.equal(e.maxPunkte, 0);
});

test("Fahrweg des Bewerbers und Umkreis der Firma sind Muss", () => {
  assert.equal(vergleiche(bewerber(), stelle(), 45).passt, false);
  assert.equal(vergleiche(bewerber({ fahrweg: "Egal, wenn der Job passt" }), stelle(), 45).passt, true);
  assert.equal(vergleiche(bewerber({ fahrweg: "Egal, wenn der Job passt" }), stelle({ umkreis: 30 }), 45).passt, false);
  const unbekannt = vergleiche(bewerber(), stelle(), null);
  assert.equal(unbekannt.passt, true, "unbekannte Entfernung schließt nicht aus");
  assert.equal(unbekannt.gruende[0].ok, null);
});

test("Beruf: Liste, eigene Angabe, falscher Beruf", () => {
  const s = stelle({ berufe: ["Mechatroniker"] });
  assert.equal(vergleiche(bewerber(), s, 10).passt, true);
  assert.equal(vergleiche(bewerber({ beruf: "Servicetechniker" }), s, 10).passt, false);
  const frei = vergleiche(bewerber({ beruf: "Steuerungsbauer" }), s, 10);
  assert.equal(frei.passt, true, "Freitext wird vom Talent Scout geprüft, nicht ausgeschlossen");
  assert.ok(frei.gruende.some(g => g.ok === null && g.text.includes("Steuerungsbauer")));
});

test("Abschluss: Mindeststufe, Studium nur mit Studium", () => {
  const meister = stelle({}, { abschluss: { wert: "Meister oder Techniker", gewicht: "muss" } });
  assert.equal(vergleiche(bewerber(), meister, 10).passt, false);
  assert.equal(vergleiche(bewerber({ abschluss: "Techniker" }), meister, 10).passt, true);
  const studium = stelle({}, { abschluss: { wert: "Studium", gewicht: "muss" } });
  assert.equal(vergleiche(bewerber({ abschluss: "Meister" }), studium, 10).passt, false);
  assert.equal(vergleiche(bewerber({ abschluss: "Studium" }), studium, 10).passt, true);
});

test("Gehalt: Untergrenze des Wunsches gegen Obergrenze der Firma", () => {
  const s = stelle({}, { gehalt: { von: 3000, bis: 3600, gewicht: "muss" } });
  assert.equal(vergleiche(bewerber(), s, 10).passt, true);
  assert.equal(vergleiche(bewerber({ gehalt: "3.800 bis 4.300 €" }), s, 10).passt, false);
  const telefon = vergleiche(bewerber({ gehalt: "Lieber am Telefon" }), s, 10);
  assert.equal(telefon.passt, true);
  assert.ok(telefon.gruende.some(g => g.feld === "gehalt" && g.ok === null));
});

test("Arbeitszeit: Tagschicht passt auch zu Schichtgängern, Teilzeit nur zu Teilzeit", () => {
  const tag = stelle({}, { arbeitszeit: { werte: ["Vollzeit tagsüber"], gewicht: "muss" } });
  assert.equal(vergleiche(bewerber({ schicht: "2-Schicht" }), tag, 10).passt, true);
  assert.equal(vergleiche(bewerber({ schicht: "Teilzeit" }), tag, 10).passt, false);
  const drei = stelle({}, { arbeitszeit: { werte: ["3-Schicht"], gewicht: "muss" } });
  assert.equal(vergleiche(bewerber({ schicht: "Vollzeit tagsüber, 2-Schicht" }), drei, 10).passt, false);
  const teil = stelle({}, { arbeitszeit: { werte: ["Teilzeit"], gewicht: "muss" } });
  assert.equal(vergleiche(bewerber({ schicht: "Teilzeit" }), teil, 10).passt, true);
});

test("Wunsch-Kriterien geben Punkte, schließen aber nie aus", () => {
  const s = stelle({}, {
    fuehrerschein: { werte: ["Staplerschein"], gewicht: "wunsch" },
    erfahrung: { wert: 5, gewicht: "wunsch" },
    deutsch: { wert: "Gut", gewicht: "wunsch" }
  });
  const e = vergleiche(bewerber(), s, 10);
  assert.equal(e.passt, true);
  assert.equal(e.maxPunkte, 3);
  assert.equal(e.punkte, 1, "nur Deutsch ist erfüllt");
  assert.match(gruendeText(e.gruende), /✗ Führerschein fehlt: Staplerschein \(Wunsch\)/);
});

test("„Egal“ wird gar nicht geprüft", () => {
  const s = stelle({}, { gehalt: { von: 0, bis: 2000, gewicht: "egal" }, arbeitszeit: { werte: ["3-Schicht"], gewicht: "egal" } });
  const e = vergleiche(bewerber(), s, 10);
  assert.equal(e.passt, true);
  assert.ok(!e.gruende.some(g => g.feld === "gehalt" || g.feld === "arbeitszeit"));
});

test("Start: wer später kann, verliert nur einen Wunsch-Punkt", () => {
  const s = stelle({ start: "Sofort" });
  const e = vergleiche(bewerber({ verfuegbarkeit: "In 2 bis 3 Monaten" }), s, 10);
  assert.equal(e.passt, true);
  assert.equal(e.punkte, 0);
  assert.equal(e.maxPunkte, 1);
});

test("Sperrliste: Firmenname mit und ohne Umlaut, Rechtsform egal, fremde Firma nicht", () => {
  assert.equal(aufSperrliste("Müller Elektrotechnik GmbH", "Mueller GmbH"), true);
  assert.equal(aufSperrliste("Müller Elektrotechnik GmbH", "müller"), true);
  assert.equal(aufSperrliste("Müller Elektrotechnik GmbH", "Schmidt KG"), false);
  assert.equal(aufSperrliste("Müller Elektrotechnik GmbH", "–"), false);
  const e = vergleiche(bewerber({ sperrliste: "Müller GmbH (mein Chef)" }), stelle(), 10);
  assert.equal(e.passt, false);
  assert.equal(e.gesperrt, true);
});
