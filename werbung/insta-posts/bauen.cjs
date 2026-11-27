// 9 Instagram-Posts (3:4, 1080×1440) für das Profilraster: KI-Motive + echte Teamfotos der Website.
// Aufruf: node werbung/insta-posts/bauen.cjs → fertig/
const fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const D = __dirname, OUT = path.join(D, "fertig");
const IMG = path.join(D, "..", "posts", "img"), KI = path.join(D, "..", "ki-v3", "roh"), TEAM = path.join(D, "..", "..", "assets");
fs.mkdirSync(OUT, { recursive: true });
const W = 1080, H = 1440;

// Reihenfolge = Raster von oben links nach unten rechts (neuester Post zuletzt posten = oben links)
const POSTS = [
  { n: "1-pov-freitag", typ: "ki", bild: `${KI}/samstag.png`, fokus: 45, kicker: "Freitag, 18:00", h: ["Dein Chef", "ruft an.", "==Schon wieder.=="], unter: "Es gibt Betriebe, in denen dein Wochenende dir gehört." },
  { n: "2-wir-rufen-an", typ: "team", bild: `${D}/team-hd/team-headset.jpg`, fokus: 20, kicker: "Unser Team", zitat: ["Wir rufen dich an.", "==Nicht dein Chef.=="], unter: "Echte Menschen statt Bewerbungsportal." },
  { n: "3-lupe", typ: "ki", bild: `${KI}/gehalt.png`, fokus: 50, kicker: "Real Talk", h: ["Mehr Arbeit.", "==Gleicher Lohn?=="], unter: "Dein Können ist woanders oft mehr wert." },
  { n: "4-das-team", typ: "team", bild: `${D}/team-hd/team-gruppe.jpg`, fokus: 50, bildPos: "30% center", kicker: "Fachkräfte Kompass", zitat: ["Wir finden", "==deinen nächsten Job.=="], unter: "Ein Team aus Rottweil. Für ganz Deutschland." },
  { n: "5-chef", typ: "ki", bild: `${KI}/chef.png`, fokus: 30, kicker: "Respekt", h: ["Du musst dir", "das nicht", "==geben.=="], unter: "Wir finden Betriebe, in denen man dich respektiert." },
  { n: "6-diskret", typ: "team", bild: `${D}/team-hd/team-handy.jpg`, fokus: 30, kicker: "100 % diskret", zitat: ["Dein Chef?", "==Erfährt nichts.=="], unter: "Bevor ein Betrieb dein Profil sieht, sprechen wir mit dir." },
  { n: "7-hamsterrad", typ: "ki", bild: `${KI}/hamsterrad.png`, fokus: 55, kicker: "Kennst du das?", h: ["Montag.", "Montag.", "==Montag.=="], unter: "Zeit, aus dem Hamsterrad rauszukommen." },
  { n: "8-zwei-minuten", typ: "liste", bild: `${D}/team-hd/team-laptop.jpg`, fokus: 62, kicker: "So einfach", h: ["Neuer Job.", "==Drei Schritte.=="], punkte: ["Kurzprofil anlegen – 2 Minuten, ohne Lebenslauf", "Wir melden uns per WhatsApp und rufen kurz an", "Du bekommst nur Jobs, die wirklich passen"] },
  { n: "9-tipp-kuendigen", typ: "ki", bild: `${KI}/ausbruch.png`, fokus: 20, kicker: "Tipp", groesse: 100, h: ["Erst kündigen,", "wenn der Neue", "==unterschrieben ist.=="], unter: "Wir suchen, während du noch im alten Job bist." }
];

const basis = `@font-face{font-family:PJS;font-weight:400 800;src:url("file://${IMG}/plus-jakarta-sans-var.woff2") format("woff2")}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden;font-family:PJS,sans-serif;color:#fff;background:#0B1220;-webkit-font-smoothing:antialiased}
.bild{position:absolute;inset:0;background-size:cover;background-repeat:no-repeat}
.korn{position:absolute;inset:0;opacity:.07;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
.marke{position:absolute;left:80px;bottom:72px;height:30px;opacity:.95}
.seite{position:absolute;right:80px;bottom:74px;font-size:22px;font-weight:600;letter-spacing:.18em;color:rgba(255,255,255,.6)}
.kicker{display:flex;align-items:center;gap:18px;font-size:24px;font-weight:700;letter-spacing:.32em;text-transform:uppercase;color:#7FA2F0}
.kicker:before{content:"";width:56px;height:3px;background:#7FA2F0}
h1{font-weight:800;letter-spacing:-.045em;line-height:.94;margin-top:30px}
h1 span{display:block}
h1 em{font-style:normal;color:#7FA2F0}
.unter{font-weight:500;font-size:34px;line-height:1.38;color:rgba(255,255,255,.82);margin-top:34px;max-width:840px}`;
const em = z => z.replace(/==(.+?)==/g, "<em>$1</em>");
const nr = p => `<span class="seite">${p.n.split("-")[0].padStart(2, "0")} / 09</span>`;

function html(p) {
  const bg = `<div class="bild" style="background-image:url('file://${p.bild}');background-position:${p.bildPos || `center ${p.fokus}%`}"></div>`;
  const marke = `<img class="marke" src="file://${IMG}/fachkraefte-kompass-logo-weiss.png">`;
  if (p.typ === "ki" || p.typ === "team") {
    const text = p.typ === "ki" ? p.h : p.zitat;
    return `<style>${basis}
    .verlauf{position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,18,32,.35) 0%,rgba(11,18,32,0) 20%,rgba(11,18,32,0) 40%,rgba(11,18,32,.82) 66%,rgba(11,18,32,.96) 100%)}
    .text{position:absolute;left:80px;right:80px;bottom:170px}
    h1{font-size:${p.groesse || 112}px}
    ${p.typ === "team" ? "h1{font-size:" + (p.groesse || 96) + "px} .bild{filter:contrast(1.04) saturate(.92)}" : ""}
    </style>${bg}<div class="verlauf"></div><div class="korn"></div>
    <div class="text"><div class="kicker">${p.kicker}</div><h1>${text.map(z => `<span>${em(z)}</span>`).join("")}</h1>${p.unter ? `<p class="unter">${p.unter}</p>` : ""}</div>
    ${marke}${nr(p)}`;
  }
  // liste: ruhige Typo-Seite mit Foto oben
  return `<style>${basis}
  body{background:#0F1B2D}
  .foto{position:absolute;left:0;right:0;top:0;height:640px;background:url('file://${p.bild}') center ${p.fokus}%/cover}
  .foto:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,27,45,0) 40%,#0F1B2D 100%)}
  .text{position:absolute;left:80px;right:80px;top:560px}
  h1{font-size:96px}
  ol{list-style:none;margin-top:52px;counter-reset:s;border-top:1px solid rgba(255,255,255,.14)}
  li{display:flex;gap:34px;align-items:baseline;padding:30px 0;border-bottom:1px solid rgba(255,255,255,.14);font-size:34px;font-weight:600;line-height:1.3;color:rgba(255,255,255,.88)}
  li:before{counter-increment:s;content:"0" counter(s);font-weight:800;font-size:30px;color:#7FA2F0;letter-spacing:.06em;flex:0 0 56px}
  </style><div class="foto"></div><div class="korn"></div>
  <div class="text"><div class="kicker">${p.kicker}</div><h1>${p.h.map(z => `<span>${em(z)}</span>`).join("")}</h1>
  <ol>${p.punkte.map(x => `<li>${x}</li>`).join("")}</ol></div>${marke}${nr(p)}`;
}

(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: W, height: H } });
  const tmp = path.join(D, "_tmp.html");
  for (const p of POSTS) {
    fs.writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"></head><body>${html(p)}</body></html>`);
    await pg.goto("file://" + tmp); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(120);
    await pg.screenshot({ path: path.join(OUT, `fk-insta-${p.n}.jpg`), type: "jpeg", quality: 92 });
  }
  fs.unlinkSync(tmp); await b.close(); console.log("fertig");
})();
