#!/usr/bin/env node
/* =====================================================================
   Build: rendert das Portal aus Config, Schema und Texten.

     node build.mjs              → dist/           (Livegang, Schriften selbst gehostet)
     node build.mjs --pages      → Hauptordner     (Vorschau über GitHub Pages, Branch main / root;
                                                    nicht von Suchmaschinen indexiert)
     node build.mjs --artifact   → dist-artifact/  (Vorschau als Claude-Artifact)

   Erzeugt außerdem CONTENT.md (alle Texte) und SCHEMA.md (Feldschema).
   Keine Abhängigkeiten – nur Node ≥ 18.
   ===================================================================== */
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as inhalt from "./src/inhalt.mjs";
import * as V from "./src/vorlagen.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const artifact = process.argv.includes("--artifact");
const pages = process.argv.includes("--pages");
const out = pages ? root : join(root, artifact ? "dist-artifact" : "dist");

const json = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));
const marke = json("config/marke.json");
const berufe = json("config/berufe.json");
const felder = json("schema/felder.json");
const webhooks = json("config/webhooks.json");

/* ---------- Prüfungen: lieber laut abbrechen als Lücken ausliefern ---------- */
const fehler = [];
for (const k of ["name", "claim", "betreiber"]) if (!marke[k]) fehler.push(`config/marke.json: "${k}" fehlt`);
for (const b of berufe) for (const k of ["key", "name", "kurz", "ob", "berufe", "fragen"]) if (!b[k] || (Array.isArray(b[k]) && !b[k].length)) fehler.push(`config/berufe.json: "${k}" fehlt bei ${b.key || b.name || "?"}`);
for (const f of felder) {
  if (!f.key || !f.typ || !f.frage) fehler.push(`schema/felder.json: Feld ohne key/typ/frage`);
  if ((f.typ === "einfach" || f.typ === "mehrfach") && !(f.optionen || []).length) fehler.push(`schema/felder.json: "${f.key}" hat keine optionen`);
}
const keys = berufe.map(b => b.key);
if (new Set(keys).size !== keys.length) fehler.push("config/berufe.json: doppelter key");
if (fehler.length) { console.error("Build abgebrochen:\n- " + fehler.join("\n- ")); process.exit(1); }

/* ---------- Logo: SVG einmal pro Seite als <symbol>, gefärbt per CSS ---------- */
/* Schrift = currentColor, Planet und Mond über --logo-planet / --logo-mond – so passt es hell wie dunkel. */
if (marke.logo && marke.logo.endsWith(".svg")) {
  const roh = readFileSync(join(root, marke.logo), "utf8");
  const viewBox = (/viewBox="([^"]+)"/.exec(roh) || [])[1];
  const farbe = { "logo-text": "currentColor", "logo-planet": "var(--logo-planet,#2B59C3)", "logo-mond": "var(--logo-mond,#7FA2F0)" };
  const pfade = [...roh.matchAll(/<path class="([\w-]+)"[^>]*\sd="([^"]+)"/g)].map(([, k, d]) => `<path fill="${farbe[k] || "currentColor"}" fill-rule="evenodd" d="${d}"/>`).join("");
  marke.logoViewBox = viewBox;
  marke.logoSymbol = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><symbol id="jobbahn-logo" viewBox="${viewBox}">${pfade}</symbol></svg>`;
}

/* ---------- Platzhalter der Marke ersetzen ---------- */
const basis = {
  marke: marke.name, betreiber: marke.betreiber, anzahl: berufe.length,
  email: marke.kontakt.email, telefon: marke.kontakt.telefon
};
const ersetze = (wert, extra = {}) => {
  const w = { ...basis, ...extra };
  if (typeof wert === "string") return wert.replace(/\{(\w+)\}/g, (m, k) => (w[k] != null ? w[k] : m));
  if (Array.isArray(wert)) return wert.map(x => ersetze(x, extra));
  if (wert && typeof wert === "object") return Object.fromEntries(Object.entries(wert).map(([k, v]) => [k, ersetze(v, extra)]));
  return wert;
};
const T = ersetze({ ...inhalt });

/* ---------- Ausgabe ---------- */
/* Im Pages-Modus ist das Ziel der Hauptordner selbst – dort wird nichts gelöscht,
   nur die erzeugten Dateien überschrieben. */
if (!pages) rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, "assets"), { recursive: true });

/* marke.css: Schriften + Farb-Tokens aus config/marke.json */
const s = marke.schriften;
/* Jede Schriftfamilie nur einmal (Text und Mono dürfen dieselbe sein). Variable Schriften
   liegen als eine Datei <familie>-var.woff2 vor, statische als <familie>-<gewicht>.woff2. */
const familien = [...new Map(Object.values(s).map(f => [f.familie, f])).values()];
const fontFaces = artifact ? "" : familien.flatMap(f => f.variabel
  ? [`@font-face{font-family:"${f.familie}";font-style:normal;font-weight:${Math.min(...f.gewichte)} ${Math.max(...f.gewichte)};font-display:swap;src:url("fonts/${V.slug(f.familie)}-var.woff2") format("woff2")}`]
  : f.gewichte.map(w => `@font-face{font-family:"${f.familie}";font-style:normal;font-weight:${w};font-display:swap;src:url("fonts/${V.slug(f.familie)}-${w}.woff2") format("woff2")}`)
).join("\n");
const tokens = (farben) => Object.entries(farben).map(([k, v]) => `--${k}:${v};`).join("");
const markeCss = `/* Erzeugt von build.mjs aus config/marke.json – nicht von Hand ändern. */
${fontFaces}
:root{${tokens(marke.farben.hell)}--f-display:"${s.display.familie}",${s.display.fallback};--w-display:${s.display.gewicht || 400};--f-text:"${s.text.familie}",${s.text.fallback};--f-mono:"${s.mono.familie}",${s.mono.fallback}}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){${tokens(marke.farben.dunkel)}color-scheme:dark}}
:root[data-theme="dark"]{${tokens(marke.farben.dunkel)}color-scheme:dark}
`;
writeFileSync(join(out, "assets/marke.css"), markeCss);

/* Alle Dateien direkt in assets/ (CSS, JS, später Logo und Figur) – Schriften separat.
   Im Pages-Modus liegen sie schon an Ort und Stelle. */
if (!pages) {
  const erzeugt = ["marke.css", "config.js"];   /* stammen aus dem Build, nicht aus dem Quellordner */
  for (const f of readdirSync(join(root, "assets"), { withFileTypes: true })) {
    if (f.isFile() && !erzeugt.includes(f.name)) copyFileSync(join(root, "assets", f.name), join(out, "assets", f.name));
  }
}
if (!artifact && !pages) {
  mkdirSync(join(out, "assets/fonts"), { recursive: true });
  for (const f of readdirSync(join(root, "assets/fonts"))) copyFileSync(join(root, "assets/fonts", f), join(out, "assets/fonts", f));
}

/* config.js für das Formular */
const config = {
  marke: { name: marke.name },
  texte: T.profil,
  berufe: berufe.map(({ key, name, kurz, aliase, berufe }) => ({ key, name, kurz, aliase, berufe })),
  felder,
  api: webhooks.api || "",
  webhooks: Object.fromEntries(Object.entries(webhooks).filter(([k]) => !k.startsWith("_") && k !== "api"))
};
writeFileSync(join(out, "assets/config.js"), `/* Erzeugt von build.mjs – nicht von Hand ändern. */\nwindow.PORTAL = ${JSON.stringify(config, null, 2)};\n`);

/* Google-Fonts-Link nur für die Artifact-Vorschau; live laufen die Schriften vom eigenen Server. */
const fontsHref = artifact
  ? "https://fonts.googleapis.com/css2?" + familien.map(f => f.gewichte.length > 1 || f.gewichte[0] !== 400 ? `family=${f.familie.replace(/ /g, "+")}:wght@${f.gewichte.join(";")}` : `family=${f.familie.replace(/ /g, "+")}`).join("&") + "&display=swap"
  : "";

const seiten = [];
function seite(pfad, meta, body, klasse = "") {
  /* In der Artifact-Vorschau ist der Titel der Startseite der Name in der Galerie. */
  const titel = artifact && pfad === "index.html" ? `${marke.name} Bewerberportal` : meta.titel;
  const h = V.head(marke, { titel, beschreibung: meta.beschreibung, pfad, artifact, vorschau: pages, fontsHref });
  const html = artifact && pfad === "index.html"
    ? `${h}\n${body}\n`
    : `<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${h}\n</head>\n<body${klasse ? ` class="${klasse}"` : ""}>\n${body}\n</body>\n</html>\n`;
  writeFileSync(join(out, pfad), html);
  seiten.push(pfad);
}

const a = T.allgemein;
seite("index.html", T.startseite.meta, V.startseite(marke, T.startseite, a, berufe));
for (const b of berufe) {
  const tb = ersetze(inhalt.berufsseite, { kategorie: b.name, kurz: b.kurz, ob: b.ob });
  seite(`${b.key}.html`, tb.meta, V.berufsseite(marke, tb, T.startseite.ablauf.schritte, a, b));
}
seite("profil.html", T.profil.meta, V.profilseite(marke, T.profil, a), "seite-profil");
seite("datenschutz.html", T.datenschutz.meta, V.datenschutzseite(marke, T.datenschutz, a, T.profil.einwilligung));
seite("impressum.html", T.impressum.meta, V.impressumseite(marke, T.impressum, a));

if (pages) {
  /* Vorschau: nicht indexieren (Rechtstexte sind Entwürfe), kein Jekyll-Umbau durch GitHub. */
  writeFileSync(join(out, "robots.txt"), "User-agent: *\nDisallow: /\n");
  writeFileSync(join(out, ".nojekyll"), "");
} else if (!artifact && marke.domain) {
  const url = (p) => `https://${marke.domain}/${p === "index.html" ? "" : p.replace(/\.html$/, "")}`;
  writeFileSync(join(out, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${seiten.filter(p => !["impressum.html", "datenschutz.html"].includes(p)).map(p => `  <url><loc>${url(p)}</loc></url>`).join("\n")}\n</urlset>\n`);
  writeFileSync(join(out, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: https://${marke.domain}/sitemap.xml\n`);
}

/* ---------- CONTENT.md ---------- */
const ohneMarke = (x) => String(x).replace(/==/g, "");
const md = [];
const st = T.startseite;
md.push(`# Inhalte – ${marke.name}`, "", `> Erzeugt von \`build.mjs\` aus \`src/inhalt.mjs\`, \`config/berufe.json\` und \`schema/felder.json\`. Änderungen bitte dort machen, nicht hier. Platzhalter in [eckigen Klammern] sind offene Fakten.`, "");
md.push("## Startseite", "", `**Seitentitel:** ${st.meta.titel}  `, `**Beschreibung:** ${st.meta.beschreibung}`, "");
md.push("### Hero", "", `- Eyebrow: ${st.hero.eyebrow}`, `- H1: **${ohneMarke(st.hero.h1)}**`, `- Maßlinie: ${st.hero.mass}`, `- Text: ${st.hero.lead}`, `- Buttons: „${st.hero.cta}“ · „${st.hero.cta2}“`, `- Fakten: ${st.hero.fakten.join(" · ")}`, "");
md.push("### Beispiel-Match (als „Beispiel“ gekennzeichnet)", "", `- ${st.matchkarte.status}: ${st.matchkarte.titel} – ${st.matchkarte.ort}`, ...st.matchkarte.zeilen.map(([l, w, n]) => `- ${l}: ${w} (${n})`), `- ${st.matchkarte.fuss}`, "");
md.push(`### ${st.ablauf.eyebrow}`, "", `**${st.ablauf.h2}**`, "", ...st.ablauf.schritte.map((x, i) => `${i + 1}. **${x.titel}** – ${x.text}`), "");
md.push(`### ${st.vertraulich.eyebrow}`, "", `**${st.vertraulich.h2}**`, "", st.vertraulich.text, "", ...st.vertraulich.punkte.map(p => `- **${p.titel}** – ${p.text}`), "");
md.push(`### ${st.vergleich.eyebrow}`, "", `**${st.vergleich.h2}**`, "", `| | ${st.vergleich.spalten[1]} | ${st.vergleich.spalten[2]} |`, "|---|---|---|", ...st.vergleich.zeilen.map(z => `| ${z.join(" | ")} |`), "");
md.push(`### ${st.berufe.eyebrow}`, "", `**${ohneMarke(st.berufe.h2)}**`, "", st.berufe.text, "");
md.push(`### ${st.faq.eyebrow}`, "", `**${st.faq.h2}**`, "", ...st.faq.eintraege.flatMap(e => [`**${e.frage}**  `, e.antwort, ""]));
md.push("### Abschluss", "", `**${ohneMarke(st.cta.h2)}** ${st.cta.text} Button: „${st.cta.button}“`, "");
md.push("## Berufsseiten", "", `Gemeinsame Texte: Eyebrow „${inhalt.berufsseite.eyebrow}“, Abschnitte „${inhalt.berufsseite.berufeH2}“, „${inhalt.berufsseite.fragenH2}“, „${inhalt.berufsseite.ablaufH2}“, „${inhalt.berufsseite.vertraulichH2}“. Button: „${inhalt.berufsseite.ctaButton}“.`, "");
for (const b of berufe) {
  const tb = ersetze(inhalt.berufsseite, { kategorie: b.name, kurz: b.kurz, ob: b.ob });
  md.push(`### ${b.name} (\`${b.key}.html\`)`, "", `- H1: **${ohneMarke(tb.h1)}**`, `- Text: ${tb.hook}`, `- Berufe: ${b.berufe.join(" · ")}`, `- Am Telefon fragen wir: ${b.fragen.join(" / ")}`, `- Deeplink: \`profil.html?beruf=${b.key}\` · Aliase: ${b.aliase.join(", ")}`, "");
}
md.push("## Kurzprofil", "", T.profil.vorschau, "");
for (const f of felder) {
  md.push(`### ${f.frage}`, "");
  if (f.hinweis) md.push(`_${ersetze(f.hinweis)}_`, "");
  if (f.optionen) md.push(f.optionen.map(o => `- ${o}`).join("\n"), "");
  if (f.typ === "kategorie") md.push(berufe.map(b => `- ${b.name} (${b.kurz})`).join("\n"), "");
  if (f.typ === "beruf") md.push(`Die Berufe der gewählten Kategorie, dazu „${T.profil.andererBeruf}“ mit Textfeld.`, "");
  if (f.typ === "kontakt") md.push(f.felder.map(k => `- ${k.label}`).join("\n"), `- ${T.profil.erreichbarkeitLabel} ${f.erreichbarkeit.join(" · ")}`, "", `**Einwilligung (${T.profil.einwilligungVersion}):** ${T.profil.einwilligung}`, "");
}
md.push("### Fehlermeldungen", "", ...Object.values(T.profil.fehler).map(x => `- ${x}`), "");
md.push("### Danke", "", `**${T.profil.danke.h1}**`, "", ...T.profil.danke.schritte.map((x, i) => `${i + 1}. ${x}`), "", T.profil.danke.loeschen, "");
md.push("## Datenschutz (Entwurf)", "", `> ${T.datenschutz.hinweis}`, "", ...T.datenschutz.abschnitte.flatMap(x => [`**${x.h}**  `, ...x.t, ""]));
md.push("## Impressum", "", ...T.impressum.zeilen.map(z => `${z}  `), "");
writeFileSync(join(root, "CONTENT.md"), md.join("\n"));

/* ---------- SCHEMA.md ---------- */
const sm = [];
sm.push("# Feldschema", "", "> Erzeugt von `build.mjs` aus `schema/felder.json`. Eine Quelle für Bewerberformular, Lead-Table-Payload und den späteren Onboarding-Bogen der Betriebe.", "");
sm.push("| # | Feld (Payload) | Frage an Bewerber | Antworten | Frage an Betrieb (Onboarding) | Matching |", "|---|---|---|---|---|---|");
felder.forEach((f, i) => {
  const ant = f.optionen ? f.optionen.join(" · ")
    : f.typ === "kategorie" ? berufe.map(b => b.name).join(" · ")
    : f.typ === "beruf" ? "Berufe der Kategorie · Anderer Beruf"
    : f.typ === "plz-ort" ? "PLZ (5 Ziffern) + Ort"
    : f.typ === "text" ? "Freitext, freiwillig"
    : f.typ === "kontakt" ? f.felder.map(k => k.label).join(" · ") + " · Erreichbarkeit · Einwilligung" : "";
  const key = f.typ === "plz-ort" ? "`plz`, `ort`" : f.typ === "kontakt" ? "`vorname`, `nachname`, `telefon`, `email`, `erreichbarkeit`, `einwilligung`" : `\`${f.key}\``;
  sm.push(`| ${i + 1} | ${key} | ${f.frage} | ${ant} | ${f.betrieb} | ${f.matching} |`);
});
sm.push("", "Mehrfachantworten kommen kommagetrennt in einem Feld an. Leere freiwillige Felder werden als `–` gesendet.", "");
sm.push("## Zusatzfelder im Payload", "", "| Feld | Inhalt |", "|---|---|",
  "| `richtung` | Key der Jobrichtung, z. B. `buero` (für den Vergleicher) |",
  "| `berufskategorie` | Name der Jobrichtung (bestimmt auch die Lead-Table-Kachel) |",
  "| `datum` | TT.MM.JJJJ |",
  `| \`quelle\` | „Bewerberportal ${marke.name}“ |`,
  "| `seite` | URL, über die das Profil abgeschickt wurde |",
  "| `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` | nur wenn in der URL vorhanden |", "");
writeFileSync(join(root, "SCHEMA.md"), sm.join("\n"));

console.log(`${pages ? "Hauptordner (GitHub Pages)" : artifact ? "dist-artifact/" : "dist/"}: ${seiten.length} Seiten → ${seiten.join(", ")}`);
console.log("CONTENT.md und SCHEMA.md aktualisiert.");
