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
  { n: "1-pov-freitag", typ: "ki", bild: `${KI}/samstag.png`, fokus: 45, kicker: "POV", h: ["Freitag, 18 Uhr.", "Dein Chef ruft an.", "==Du weißt schon.=="], unter: "Es gibt Betriebe, in denen dein Wochenende dir gehört." },
  { n: "2-wir-rufen-an", typ: "team", bild: `${TEAM}/team-headset.jpg`, fokus: 15, blaseUnten: 250, kicker: "UNSER TEAM", blase: "Wir rufen dich an.<br>Nicht dein Chef. 📞", unter: "Echte Menschen statt Bewerbungsportal. Wir hören zu – und suchen dann für dich." },
  { n: "3-lupe", typ: "ki", bild: `${KI}/gehalt.png`, fokus: 55, kicker: "REAL TALK", h: ["Brauchst du auch", "==eine Lupe==", "für deinen Lohn?"], unter: "Dein Können ist woanders oft mehr wert." },
  { n: "4-das-team", typ: "team", bild: `${TEAM}/team-gruppe.jpg`, fokus: 50, blaseUnten: 250, blaseGroesse: 64, bildPos: "28% center", kicker: "HI 👋", blase: "Das sind die,<br>die deinen nächsten<br>Job finden.", unter: "Fachkräfte Kompass aus Rottweil – für ganz Deutschland." },
  { n: "5-chef", typ: "ki", bild: `${KI}/chef.png`, fokus: 40, kicker: "STOPP", h: ["Du musst dir", "das nicht", "==geben.=="], unter: "Wir finden Betriebe, in denen man dich respektiert." },
  { n: "6-diskret", typ: "team", bild: `${TEAM}/team-handy.jpg`, fokus: 35, kicker: "100% DISKRET", blase: "Dein Chef?<br>Erfährt nichts. 🤫", unter: "Bevor ein Betrieb dein Profil sieht, sprechen wir mit dir. Immer." },
  { n: "7-hamsterrad", typ: "ki", bild: `${KI}/hamsterrad.png`, fokus: 62, kicker: "KENNST DU?", h: ["Montag.", "Montag.", "==Montag.=="], unter: "Zeit, aus dem Hamsterrad rauszukommen." },
  { n: "8-zwei-minuten", typ: "liste", bild: `${TEAM}/team-laptop.jpg`, fokus: 40, kicker: "SO EINFACH", h: ["Neuer Job.", "==3 Schritte.=="], punkte: ["Kurzprofil anlegen – 2 Minuten, ohne Lebenslauf", "Wir schreiben dir per WhatsApp und rufen kurz an", "Du bekommst nur Jobs, die wirklich passen"] },
  { n: "9-tipp-kuendigen", typ: "ki", bild: `${KI}/ausbruch.png`, fokus: 72, kicker: "TIPP", groesse: 96, h: ["Kündige erst,", "wenn der Neue", "==unterschrieben ist.=="], unter: "Wir suchen, während du noch im alten Job bist. Ganz entspannt." }
];

const basis = `@font-face{font-family:PJS;font-weight:400 800;src:url("file://${IMG}/plus-jakarta-sans-var.woff2") format("woff2")}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden;font-family:PJS,sans-serif;color:#fff;background:#0B1220}
.bild{position:absolute;inset:0;background-size:cover;background-repeat:no-repeat}
.logo{position:absolute;left:64px;top:60px;height:36px}
.kicker{position:absolute;right:56px;top:50px;background:#7FA2F0;color:#0F1B2D;font-weight:800;font-size:30px;letter-spacing:3px;padding:14px 24px;border-radius:12px;transform:rotate(3deg);box-shadow:7px 7px 0 #2B59C3}
.stempel{position:absolute;width:210px;height:210px}
.stempel svg{width:100%;height:100%;animation:none}
h1{font-weight:800;letter-spacing:-4px;line-height:.98;text-shadow:0 6px 30px rgba(0,0,0,.55)}
h1 span{display:block}
h1 em{font-style:normal;color:#0F1B2D;background:#7FA2F0;padding:2px 18px 10px;border-radius:16px;display:inline-block;margin-top:14px;transform:rotate(-2deg);text-shadow:none;box-shadow:10px 10px 0 #2B59C3}
.unter{font-weight:700;font-size:36px;line-height:1.28;color:#E8ECF2;text-shadow:0 2px 14px rgba(0,0,0,.7)}
.fuss{position:absolute;left:64px;right:64px;bottom:58px;display:flex;justify-content:space-between;align-items:center;font-weight:800;font-size:28px}
.fuss .link{background:#fff;color:#0F1B2D;padding:16px 26px;border-radius:999px;box-shadow:0 8px 0 #2B59C3}
.fuss .klein{color:#C9D6F5;font-size:24px;font-weight:700}`;
const stempel = (farbe, text) => `<svg viewBox="0 0 200 200"><defs><path id="k" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0"/></defs>
<circle cx="100" cy="100" r="98" fill="${farbe}"/><text font-family="PJS" font-weight="800" font-size="17" letter-spacing="2.2" fill="#0F1B2D"><textPath href="#k" textLength="480" lengthAdjust="spacingAndGlyphs">${text}</textPath></text>
<text x="100" y="118" text-anchor="middle" font-family="PJS" font-weight="800" font-size="54" fill="#0F1B2D">0 €</text></svg>`;
const fuss = `<div class="fuss"><span class="link">🧭 Link in Bio</span><span class="klein">Kurzprofil in 2 Min.</span></div>`;
const em = z => z.replace(/==(.+?)==/g, "<em>$1</em>");

function html(p) {
  const bg = `<div class="bild" style="background-image:url('file://${p.bild}');background-position:${p.bildPos || `center ${p.fokus}%`}"></div>`;
  const logo = `<img class="logo" src="file://${IMG}/fachkraefte-kompass-logo-weiss.png">`;
  if (p.typ === "ki") return `<style>${basis}
  .verlauf{position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,18,32,.75) 0%,rgba(11,18,32,0) 22%,rgba(11,18,32,0) 38%,rgba(11,18,32,.88) 68%,rgba(11,18,32,.97) 100%)}
  .text{position:absolute;left:64px;right:64px;bottom:170px}
  h1{font-size:${p.groesse || 118}px}
  .unter{margin-top:34px;max-width:900px}
  .stempel{right:60px;top:150px;transform:rotate(-12deg)}
  </style>${bg}<div class="verlauf"></div>${logo}<span class="kicker">${p.kicker}</span>
  <div class="stempel">${stempel("#FFFFFF", "KOSTENLOS • VERTRAULICH • OHNE CV • ")}</div>
  <div class="text"><h1>${p.h.map(z => `<span>${em(z)}</span>`).join("")}</h1><p class="unter">${p.unter}</p></div>${fuss}`;
  if (p.typ === "team") return `<style>${basis}
  .bild{filter:saturate(.9) contrast(1.05)}
  .tint{position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,27,45,.55) 0%,rgba(15,27,45,0) 25%,rgba(15,27,45,0) 45%,rgba(15,27,45,.92) 78%,#0F1B2D 100%)}
  .blase{position:absolute;left:64px;right:110px;bottom:${p.blaseUnten || 330}px;background:#fff;color:#0F1B2D;border-radius:36px;padding:44px 48px;font-weight:800;font-size:${p.blaseGroesse || 76}px;line-height:1.02;letter-spacing:-2.5px;box-shadow:14px 14px 0 #2B59C3;transform:rotate(-1.5deg)}
  .blase:after{content:"";position:absolute;left:90px;top:-38px;border:40px solid transparent;border-bottom:44px solid #fff;border-top:0}
  .unter{position:absolute;left:64px;right:64px;bottom:150px;font-size:31px}
  </style>${bg}<div class="tint"></div>${logo}<span class="kicker">${p.kicker}</span>
  <div class="blase">${p.blase}</div><p class="unter">${p.unter}</p>${fuss}`;
  // liste
  return `<style>${basis}
  body{background:#2B59C3}
  .foto{position:absolute;right:0;top:0;width:470px;height:740px;background:url('file://${p.bild}') center ${p.fokus}%/cover;border-bottom-left-radius:60px;box-shadow:-16px 16px 0 #0F1B2D}
  .bg2{position:absolute;inset:0;background:radial-gradient(90% 60% at 0% 100%,#0F1B2D 0,transparent 70%)}
  h1{position:absolute;left:64px;top:200px;font-size:96px;width:560px;letter-spacing:-3px}
  h1 em{white-space:nowrap}
  h1 em{background:#fff;color:#2B59C3;box-shadow:10px 10px 0 #0F1B2D}
  .kicker{background:#0F1B2D;color:#fff;box-shadow:7px 7px 0 #7FA2F0;left:64px;right:auto;top:120px;transform:rotate(-3deg)}
  .logo{top:auto;bottom:66px}
  ol{position:absolute;left:64px;right:64px;top:820px;list-style:none;display:flex;flex-direction:column;gap:26px;counter-reset:s}
  li{display:flex;gap:28px;align-items:center;background:#0F1B2D;border-radius:26px;padding:26px 30px;font-weight:700;font-size:36px;line-height:1.22;box-shadow:8px 8px 0 rgba(15,27,45,.35)}
  li:before{counter-increment:s;content:counter(s);flex:0 0 76px;height:76px;border-radius:50%;background:#7FA2F0;color:#0F1B2D;display:grid;place-items:center;font-weight:800;font-size:42px}
  .fuss{justify-content:flex-end}
  </style><div class="bg2"></div><div class="foto"></div><span class="kicker">${p.kicker}</span>
  <h1>${p.h.map(z => `<span>${em(z)}</span>`).join("")}</h1>
  <ol>${p.punkte.map(x => `<li>${x}</li>`).join("")}</ol>${logo}<div class="fuss"><span class="link">🧭 Link in Bio</span></div>`;
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
