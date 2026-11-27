// 6 Team-Posts „Wer wir sind & was wir machen“ (4:5, 1080×1350): echtes Teamfoto oben, helle Textfläche unten.
// Aufruf: node werbung/insta-team/bauen.cjs → fertig/
const fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const D = __dirname, OUT = path.join(D, "fertig");
const IMG = path.join(D, "..", "posts", "img"), TEAM = path.join(D, "..", "insta-posts", "team-hd");
fs.mkdirSync(OUT, { recursive: true });
const W = 1080, H = 1350, FOTO = 900;
const POSTS = [
  { bild: "team-gruppe.jpg", pos: "35% 35%", k: "Wer wir sind", h: "Das ist <em>Fachkräfte Kompass.</em>", t: "Wir bringen Fachkräfte und Betriebe zusammen – persönlich und auf Augenhöhe." },
  { bild: "team-ansprechpartner.jpg", pos: "50% 22%", k: "Dein Ansprechpartner", h: "Ein Gesicht. <em>Kein Callcenter.</em>", t: "Du hast bei uns einen festen Ansprechpartner – vom ersten Gespräch bis zum neuen Job." },
  { bild: "team-headset.jpg", pos: "50% 40%", k: "Was wir machen", h: "Erst zuhören. <em>Dann suchen.</em>", t: "Was kannst du, was willst du, was ist dir wichtig? Darum geht es im ersten Gespräch." },
  { bild: "team-laptop.jpg", pos: "50% 55%", k: "Was wir machen", h: "Wir suchen <em>für dich.</em>", t: "Wir gleichen dein Profil mit passenden Betrieben ab – in deiner Nähe und in ganz Deutschland." },
  { bild: "team-handy.jpg", pos: "50% 30%", k: "So erreichst du uns", h: "Schnell. <em>Unkompliziert.</em>", t: "Per WhatsApp oder Telefon – wir melden uns, sobald du dein Kurzprofil angelegt hast." },
  { bild: "team-gruppe.jpg", pos: "78% 72%", gr: "165%", k: "Dein nächster Schritt", h: "Lass uns <em>loslegen.</em>", t: "Kurzprofil in 2 Minuten anlegen – kostenlos, ohne Lebenslauf, vertraulich.", cta: true }
];
const CSS = `@font-face{font-family:PJS;font-weight:400 800;src:url("file://${IMG}/plus-jakarta-sans-var.woff2") format("woff2")}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden;font-family:PJS,sans-serif;background:#F6F8FC;color:#0F1B2D;-webkit-font-smoothing:antialiased}
.foto{position:absolute;left:0;right:0;top:0;height:${FOTO}px;background-size:cover;filter:contrast(1.03) saturate(.95)}
.logo{position:absolute;left:64px;top:56px;height:34px;filter:drop-shadow(0 2px 10px rgba(0,0,0,.35))}
.nr{position:absolute;right:64px;top:60px;font-size:22px;font-weight:700;letter-spacing:.16em;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.4)}
.flaeche{position:absolute;left:0;right:0;top:${FOTO}px;bottom:0;background:#F6F8FC}
.flaeche:before{content:"";position:absolute;left:0;right:0;top:0;height:8px;background:linear-gradient(90deg,#2B59C3,#7FA2F0)}
.text{position:absolute;left:72px;right:72px;top:${FOTO + 54}px}
.k{font-size:22px;font-weight:800;letter-spacing:.24em;text-transform:uppercase;color:#2B59C3}
h1{font-size:64px;font-weight:800;letter-spacing:-.035em;line-height:1.04;margin-top:14px}
h1 em{font-style:normal;color:#2B59C3}
.t{font-size:28px;font-weight:500;line-height:1.42;color:#4A5568;margin-top:16px;max-width:900px}
.cta{position:absolute;left:72px;bottom:56px;display:inline-flex;align-items:center;gap:14px;background:#0F1B2D;color:#fff;font-size:26px;font-weight:700;padding:18px 30px;border-radius:999px}
.marke{position:absolute;right:72px;bottom:62px;height:28px}`;
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: W, height: H } });
  const tmp = path.join(D, "_tmp.html");
  for (let i = 0; i < POSTS.length; i++) {
    const p = POSTS[i], nr = String(i + 1).padStart(2, "0");
    fs.writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
      <div class="foto" style="background-image:url('file://${TEAM}/${p.bild}');background-position:${p.pos};background-size:${p.gr || 'cover'}"></div>
      <span class="nr">${nr} / 06</span>
      <div class="flaeche"></div>
      <div class="text"><div class="k">${p.k}</div><h1>${p.h}</h1><p class="t">${p.t}</p></div>
      ${p.cta ? `<span class="cta">Link in der Bio →</span>` : ""}
      <img class="marke" src="file://${IMG}/fachkraefte-kompass-logo-nachtblau.png"></body></html>`);
    await pg.goto("file://" + tmp); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(120);
    await pg.screenshot({ path: path.join(OUT, `fk-team-${nr}.jpg`), type: "jpeg", quality: 93 });
  }
  fs.unlinkSync(tmp); await b.close(); console.log("fertig");
})();
