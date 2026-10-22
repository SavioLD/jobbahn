/* =====================================================================
   HTML-Vorlagen. Jede Seite ist eine Funktion, die {head, body} liefert.
   Texte kommen aus src/inhalt.mjs (schon mit Marke ersetzt), Berufe aus
   config/berufe.json. Keine Texte hier hart einbauen.
   ===================================================================== */

export const esc = (s) => String(s ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const slug = (s) => String(s).toLowerCase()
  .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/* ---------- Icons (inline, erben die Textfarbe) ---------- */
const svg = (inner, vb = "0 0 24 24") =>
  `<svg viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inner}</svg>`;
export const icon = {
  check: svg('<circle cx="12" cy="12" r="9.5"/><path d="m7.5 12.3 3 3 6-6.3"/>'),
  haken: svg('<path d="m5 12.5 4.5 4.5L19 7.5" stroke-width="3"/>'),
  pfeil: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  telefon: svg('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>'),
  auge: svg('<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c5.5 0 9 5 10 7a14 14 0 0 1-2.6 3.4M6.6 6.6A14.5 14.5 0 0 0 2 12c1 2 4.5 7 10 7a9.6 9.6 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/>'),
  sprechen: svg('<path d="M21 12a8 8 0 0 1-11.8 7L4 20.5l1.5-4.8A8 8 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01" stroke-width="3"/>'),
  sperre: svg('<circle cx="12" cy="12" r="9.5"/><path d="m5.5 5.5 13 13"/>'),
  loeschen: svg('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>')
};

/* Wortmarke-Symbol: Welle in der Bohrung – eine Passung. Platzhalter,
   bis ein Logo in config/marke.json eingetragen ist. */
const passungSymbol = `<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><rect x="2" y="2" width="28" height="28" rx="7" fill="none" stroke="currentColor" stroke-width="3"/><circle class="punkt" cx="16" cy="16" r="8.5"/></svg>`;

export function logo(m, href = "./") {
  const inner = m.logo
    ? `<img src="${esc(m.logo)}" alt="${esc(m.name)}">`
    : `${passungSymbol}<span class="logo-wort">${esc(m.name)}</span>`;
  return `<a class="logo" href="${href}" aria-label="${esc(m.name)} – Startseite">${inner}</a>`;
}

/* ---------- Rahmen ---------- */
export function kopf(m, a, { minimal = false, rechts = "" } = {}) {
  const nav = minimal ? "" : `<nav class="nav" aria-label="Hauptnavigation">${a.nav.map(n => `<a href="${esc(n.href)}">${esc(n.text)}</a>`).join("")}</nav>`;
  const cta = minimal ? rechts : `<a class="btn btn-primaer btn-klein" href="profil.html">${esc(a.navCta)}</a>`;
  return `<header class="kopf${minimal ? " profil-kopf" : ""}"><div class="wrap kopf-innen">${logo(m)}${nav}${cta}</div></header>`;
}

export function fuss(m, a) {
  const f = a.footer;
  return `<footer class="fuss"><div class="wrap fuss-innen">
  <div class="fuss-spalte">${logo(m)}<p>${esc(f.zeile)}</p><p>${esc(f.betreiber)}</p></div>
  <div class="fuss-spalte"><div class="fuss-links">
    <a href="${esc(m.betreiberUrl)}" rel="noopener">${esc(f.fuerBetriebe)}</a>
    <a href="impressum.html">${esc(f.impressum)}</a>
    <a href="datenschutz.html">${esc(f.datenschutz)}</a>
  </div></div>
</div></footer>`;
}

export function head(m, { titel, beschreibung, pfad, artifact, vorschau, fontsHref }) {
  const canonical = m.domain && !vorschau ? `https://${m.domain}/${pfad === "index.html" ? "" : pfad.replace(/\.html$/, "")}` : "";
  return [
    `<title>${esc(titel)}</title>`,
    artifact ? `<meta name="claude:viewport-fit-sides" content="cover">` : "",
    vorschau ? `<meta name="robots" content="noindex, nofollow">` : "",
    `<meta name="description" content="${esc(beschreibung)}">`,
    `<meta name="theme-color" content="${esc(m.farben.hell.akzent)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:locale" content="de_DE">`,
    `<meta property="og:site_name" content="${esc(m.name)}">`,
    `<meta property="og:title" content="${esc(titel)}">`,
    `<meta property="og:description" content="${esc(beschreibung)}">`,
    canonical && !artifact ? `<link rel="canonical" href="${esc(canonical)}">` : "",
    fontsHref ? `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${esc(fontsHref)}">` : "",
    `<link rel="stylesheet" href="assets/marke.css">`,
    `<link rel="stylesheet" href="assets/style.css">`
  ].filter(Boolean).join("\n");
}

/* ---------- Bausteine ---------- */
const eyebrow = (t) => `<p class="eyebrow">${esc(t)}</p>`;
/* ==Wort== → gelb markiert (Ländle-Digital-Markierung) */
export const markiert = (s) => esc(s).replace(/==(.+?)==/g, '<span class="hl">$1</span>');

function ablaufListe(schritte) {
  return `<ol class="ablauf">${schritte.map((s, i) => `<li><span class="ablauf-nr">${String(i + 1).padStart(2, "0")}</span><h3 class="h3">${esc(s.titel)}</h3><p>${esc(s.text)}</p></li>`).join("")}</ol>`;
}

function matchKarte(k) {
  return `<aside class="karte-match" aria-label="Beispiel für einen Match">
  <div class="karte-kopf"><span class="pille-beispiel">${esc(k.label)}</span><span class="match-status">${esc(k.status)}</span></div>
  <div><p class="match-titel">${esc(k.titel)}</p><p class="match-ort">${esc(k.ort)}</p></div>
  <ul class="match-zeilen">${k.zeilen.map(([l, w, n]) => `<li>${icon.check}<span class="z-label">${esc(l)}</span><span class="z-wert">${esc(w)}</span><span class="z-notiz">${esc(n)}</span></li>`).join("")}</ul>
  <p class="match-fuss">${icon.telefon}${esc(k.fuss)}</p>
</aside>`;
}

function berufeKacheln(berufe) {
  return `<div class="berufe-raster">${berufe.map(b => `<a class="beruf-kachel" href="${b.key}.html"><span class="name">${esc(b.name)}</span><span class="kurz">${esc(b.kurz)}</span><span class="los">Jobs ansehen ${icon.pfeil}</span></a>`).join("")}</div>`;
}

const punktIcons = [icon.auge, icon.sprechen, icon.sperre, icon.loeschen];

/* ---------- Seiten ---------- */
export function startseite(m, t, a, berufe) {
  const h = t.hero;
  return `${kopf(m, a)}
<main>
<section class="hero"><div class="wrap hero-raster">
  <div class="hero-text">
    ${eyebrow(h.eyebrow)}
    <h1 class="h1">${markiert(h.h1)}</h1>
    <p class="masslinie"><span aria-hidden="true"></span>${esc(h.mass)}<span aria-hidden="true"></span></p>
    <p class="lead">${esc(h.lead)}</p>
    <div class="hero-aktionen">
      <a class="btn btn-primaer" href="profil.html">${esc(h.cta)} ${icon.pfeil}</a>
      <a class="btn btn-sekundaer" href="#ablauf">${esc(h.cta2)}</a>
    </div>
    <ul class="fakten">${h.fakten.map(f => `<li>${icon.check}${esc(f)}</li>`).join("")}</ul>
  </div>
  ${m.figur
    ? `<div class="hero-bild"><img class="figur" src="${esc(m.figur)}" alt="" width="480" height="600">${matchKarte(t.matchkarte)}</div>`
    : matchKarte(t.matchkarte)}
</div></section>

<section class="abschnitt" id="ablauf"><div class="wrap">
  <div class="abschnitt-kopf">${eyebrow(t.ablauf.eyebrow)}<h2 class="h2">${esc(t.ablauf.h2)}</h2></div>
  ${ablaufListe(t.ablauf.schritte)}
</div></section>

<section class="abschnitt band" id="vertraulich"><div class="wrap vertraulich-raster">
  <div class="vertraulich-text">${eyebrow(t.vertraulich.eyebrow)}<h2 class="h2">${esc(t.vertraulich.h2)}</h2><p class="lead">${esc(t.vertraulich.text)}</p></div>
  <ul class="punkte">${t.vertraulich.punkte.map((p, i) => `<li>${punktIcons[i % punktIcons.length]}<h3 class="h3">${esc(p.titel)}</h3><p>${esc(p.text)}</p></li>`).join("")}</ul>
</div></section>

<section class="abschnitt" id="unterschied"><div class="wrap">
  <div class="abschnitt-kopf">${eyebrow(t.vergleich.eyebrow)}<h2 class="h2">${esc(t.vergleich.h2)}</h2></div>
  <div class="tabelle-wrap"><table class="vergleich">
    <thead><tr><th scope="col"><span class="nur-sr">Thema</span>${esc(t.vergleich.spalten[0])}</th><th scope="col">${esc(t.vergleich.spalten[1])}</th><th scope="col" class="unsere">${esc(t.vergleich.spalten[2])}</th></tr></thead>
    <tbody>${t.vergleich.zeilen.map(([th, alt, neu]) => `<tr><th scope="row">${esc(th)}</th><td data-label="${esc(t.vergleich.spalten[1])}">${esc(alt)}</td><td class="unsere" data-label="${esc(t.vergleich.spalten[2])}">${esc(neu)}</td></tr>`).join("")}</tbody>
  </table></div>
</div></section>

<section class="abschnitt" id="berufe"><div class="wrap">
  <div class="abschnitt-kopf">${eyebrow(t.berufe.eyebrow)}<h2 class="h2">${markiert(t.berufe.h2)}</h2><p class="lead">${esc(t.berufe.text)}</p></div>
  ${berufeKacheln(berufe)}
</div></section>

<section class="abschnitt" id="fragen"><div class="wrap">
  <div class="abschnitt-kopf">${eyebrow(t.faq.eyebrow)}<h2 class="h2">${esc(t.faq.h2)}</h2></div>
  <div class="faq">${t.faq.eintraege.map(e => `<details><summary>${esc(e.frage)}</summary><p>${esc(e.antwort)}</p></details>`).join("")}</div>
</div></section>

<section class="cta-band"><div class="wrap cta-innen">
  <div><h2 class="h2">${markiert(t.cta.h2)}</h2><p>${esc(t.cta.text)}</p></div>
  <a class="btn btn-primaer" href="profil.html">${esc(t.cta.button)} ${icon.pfeil}</a>
</div></section>
</main>
${fuss(m, a)}`;
}

export function berufsseite(m, t, ablauf, a, b) {
  const profilLink = `profil.html?beruf=${b.key}`;
  return `${kopf(m, a)}
<main>
<section class="hero"><div class="wrap hero-raster">
  <div class="hero-text">
    <a class="zurueck-link" href="./#berufe">${icon.pfeil}${esc(t.zurueck)}</a>
    ${eyebrow(t.eyebrow)}
    <h1 class="h1 h1-klein">${markiert(t.h1)}</h1>
    <p class="lead">${esc(t.hook)}</p>
    <div class="hero-aktionen"><a class="btn btn-primaer" href="${profilLink}">${esc(t.cta)} ${icon.pfeil}</a></div>
  </div>
  <div class="karte-berufe">
    <h2 class="h3">${esc(t.berufeH2)}</h2>
    <p class="text-2">${esc(t.berufeText)}</p>
    <ul class="chips">${b.berufe.map(x => `<li><a href="${profilLink}&amp;als=${slug(x)}">${esc(x)} ${icon.pfeil}</a></li>`).join("")}</ul>
  </div>
</div></section>

<section class="abschnitt"><div class="wrap">
  <div class="abschnitt-kopf"><h2 class="h2">${esc(t.fragenH2)}</h2><p class="lead">${esc(t.fragenText)}</p></div>
  <ul class="fragen">${b.fragen.map(f => `<li>${esc(f)}</li>`).join("")}</ul>
</div></section>

<section class="abschnitt"><div class="wrap">
  <div class="abschnitt-kopf"><h2 class="h2">${esc(t.ablaufH2)}</h2></div>
  ${ablaufListe(ablauf)}
</div></section>

<section class="abschnitt band"><div class="wrap vertraulich-raster">
  <div class="vertraulich-text"><h2 class="h2">${esc(t.vertraulichH2)}</h2></div>
  <p class="lead">${esc(t.vertraulichText)}</p>
</div></section>

<section class="cta-band"><div class="wrap cta-innen">
  <div><h2 class="h2">${markiert(t.ctaH2)}</h2></div>
  <a class="btn btn-primaer" href="${profilLink}">${esc(t.ctaButton)} ${icon.pfeil}</a>
</div></section>
</main>
${fuss(m, a)}`;
}

export function profilseite(m, t, a) {
  const rechts = `<a class="btn btn-leise btn-klein" href="./">${esc(t.abbrechen)}</a>`;
  return `${kopf(m, a, { minimal: true, rechts })}
<main class="profil-haupt"><div class="wrap">
  <form class="formular-karte" id="profil-form" novalidate>
    <p class="vorschau-hinweis" id="vorschau-hinweis" hidden>${esc(t.vorschau)}</p>
    <div class="fortschritt" id="fortschritt">
      <p class="fortschritt-text"><span>${esc(t.kopf)}</span><span id="fortschritt-text"></span></p>
      <div class="fortschritt-balken" aria-hidden="true"><span id="fortschritt-balken"></span></div>
    </div>
    <p class="nur-sr" id="ansage" aria-live="polite"></p>
    <div class="schritte" id="schritte"><noscript><p>Bitte aktiviere JavaScript, um das Kurzprofil auszufüllen.</p></noscript></div>
    <div class="formular-nav" id="formular-nav">
      <button type="button" class="btn btn-leise" id="btn-zurueck">${esc(t.zurueck)}</button>
      <button type="submit" class="btn btn-primaer" id="btn-weiter">${esc(t.weiter)}</button>
    </div>
    <div class="danke" id="danke" hidden></div>
  </form>
</div></main>
<script src="assets/config.js"></script>
<script src="assets/profil.js"></script>`;
}

export function datenschutzseite(m, t, a, einwilligung) {
  return `${kopf(m, a)}
<main class="abschnitt"><div class="wrap recht">
  <p class="entwurf">${esc(t.hinweis)}</p>
  <h1 class="h2">${esc(t.h1)}</h1>
  ${t.abschnitte.map(s => `<section><h2 class="h3">${esc(s.h)}</h2>${s.t.map(p => `<p>${esc(p)}</p>`).join("")}</section>`).join("")}
  <section id="einwilligung"><h2 class="h3">${esc(t.einwilligungH)}</h2><p>„${esc(einwilligung)}“</p></section>
</div></main>
${fuss(m, a)}`;
}

export function impressumseite(m, t, a) {
  return `${kopf(m, a)}
<main class="abschnitt"><div class="wrap recht">
  <h1 class="h2">${esc(t.h1)}</h1>
  <section>${t.zeilen.map(z => `<p>${esc(z)}</p>`).join("")}</section>
</div></main>
${fuss(m, a)}`;
}
