import { test } from "node:test";
import assert from "node:assert/strict";
import { ausHtml, websiteAdresse } from "../src/website.js";

test("Beschreibung aus meta description, Entitäten dekodiert", () => {
  const html = `<html><head><title>Müller Metallbau &ndash; Start</title>
    <meta property="og:site_name" content="Müller Metallbau GmbH">
    <meta name="description" content="Familienbetrieb seit 1962: Stahlbau, Treppen &amp; Geländer f&uuml;r die Region.">
  </head><body><p>egal</p></body></html>`;
  assert.deepEqual(ausHtml(html), { titel: "Müller Metallbau GmbH", text: "Familienbetrieb seit 1962: Stahlbau, Treppen & Geländer für die Region." });
});

test("ohne Beschreibung: erster längerer Absatz, Cookie-Hinweise übersprungen", () => {
  const html = `<title>Schmid AG</title><footer><p>${"x".repeat(100)}</p></footer>
    <p>Wir verwenden Cookies, um die Website zu verbessern, und Datenschutz ist uns wichtig, darum fragen wir.</p>
    <p>Die Schmid AG entwickelt und fertigt seit über 40 Jahren Sondermaschinen für die Automobil- und Medizintechnik.</p>`;
  const r = ausHtml(html);
  assert.equal(r.titel, "Schmid AG");
  assert.match(r.text, /^Die Schmid AG entwickelt/);
});

test("lange Texte werden am Satzende gekürzt", () => {
  const satz = "Das ist ein Satz über die Firma mit etwas Inhalt. ";
  const r = ausHtml(`<meta name="description" content="${satz.repeat(12)}">`);
  assert.ok(r.text.length <= 320);
  assert.ok(r.text.endsWith("."));
});

test("Website-Adressen: ergänzt https, lehnt Interna ab", () => {
  assert.equal(websiteAdresse("www.mueller.de"), "https://www.mueller.de/");
  assert.equal(websiteAdresse("http://mueller.de/ueber-uns"), "http://mueller.de/ueber-uns");
  assert.equal(websiteAdresse("localhost:8080"), "");
  assert.equal(websiteAdresse("http://192.168.0.1"), "");
  assert.equal(websiteAdresse("ftp://mueller.de"), "");
  assert.equal(websiteAdresse(""), "");
});
