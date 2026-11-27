// 9 Instagram-Posts „Vorstellung & Ablauf“ (3:4, 1080×1440): 3D-Motive (KI) + Typo.
// Rohbilder: roh/01.png … roh/09.png. Aufruf: node werbung/insta-3d/bauen.cjs → fertig/
const fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const D = __dirname, OUT = path.join(D, "fertig"), IMG = path.join(D, "..", "posts", "img");
fs.mkdirSync(OUT, { recursive: true });
const TEAM = path.join(D, "..", "insta-posts", "team-hd");
// team: echtes Teamfoto statt 3D-Motiv (pos = Bildausschnitt)
const POSTS = [
  { team: "team-ansprechpartner.jpg", pos: "center 20%", k: "Hallo 👋", h: ["Wir sind", "==Fachkräfte Kompass.=="], t: "Dein Wegweiser zum neuen Job." },
  { roh: "02", k: "Kennst du das?", h: ["Dein Job", "==passt nicht mehr?=="], t: "Zu wenig Lohn, zu viel Stress, kein Respekt." },
  { team: "team-gruppe.jpg", pos: "30% center", k: "Unser Job", h: ["Wir finden einen,", "==der passt.=="], t: "Für dich gesucht – in deiner Nähe." },
  { roh: "04", k: "Schritt 1", h: ["Kurzprofil", "==in 2 Minuten.=="], t: "Ohne Lebenslauf. Ohne Anschreiben." },
  { team: "team-handy.jpg", pos: "center 25%", k: "Schritt 2", h: ["Kurz per", "==WhatsApp.=="], t: "Ein paar Fragen – mehr nicht." },
  { team: "team-headset.jpg", pos: "center 20%", k: "Schritt 3", h: ["Wir rufen", "==dich an.=="], t: "Ein echter Mensch. Kein Bot." },
  { roh: "07", k: "Schritt 4", h: ["Du", "==entscheidest.=="], t: "Erst dein Ja – dann geht's los." },
  { roh: "08", k: "Für dich", h: ["Komplett", "==kostenlos.=="], t: "Heute, morgen, immer." },
  { roh: "09", k: "Versprochen", h: ["Dein Chef", "==erfährt nichts.=="], t: "100 % vertraulich." }
];
const FORMATE = { "post-4x5": [1080, 1350], "insta-3x4": [1080, 1440] };
const CSS = `@font-face{font-family:PJS;font-weight:400 800;src:url("file://${IMG}/plus-jakarta-sans-var.woff2") format("woff2")}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:var(--w);height:var(--h);overflow:hidden;font-family:PJS,sans-serif;color:#fff;background:#0F1B2D;-webkit-font-smoothing:antialiased}
.bild{position:absolute;inset:0;background-size:cover;background-position:center bottom}
.text{position:absolute;left:84px;right:84px;top:96px;text-align:center}
.text.unten{top:auto;bottom:150px}
.team{position:absolute;inset:0;background-size:cover}
.team-tint{position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,27,45,.35) 0%,rgba(15,27,45,0) 18%,rgba(15,27,45,0) 42%,rgba(15,27,45,.88) 66%,rgba(15,27,45,.98) 100%),linear-gradient(0deg,rgba(43,89,195,.18),rgba(43,89,195,.18))}
.team-glow{position:absolute;inset:0;box-shadow:inset 0 0 160px rgba(43,89,195,.35)}
.k{display:inline-block;font-size:24px;font-weight:700;letter-spacing:.3em;text-transform:uppercase;color:#7FA2F0;padding:12px 24px;border:1.5px solid rgba(127,162,240,.45);border-radius:999px;background:rgba(15,27,45,.4)}
h1{font-weight:800;font-size:100px;line-height:.98;letter-spacing:-.045em;margin-top:34px}
h1 span{display:block} h1 em{font-style:normal;color:#7FA2F0}
.t{font-size:32px;font-weight:500;color:rgba(255,255,255,.75);margin-top:26px}
.fuss{position:absolute;left:84px;right:84px;bottom:64px;display:flex;justify-content:space-between;align-items:center}
.fuss img{height:30px}.fuss span{font-size:22px;font-weight:600;letter-spacing:.18em;color:rgba(255,255,255,.55)}`;
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage();
  const tmp = path.join(D, "_tmp.html");
  for (const [fmt, [W, H]] of Object.entries(FORMATE)) {
    fs.mkdirSync(path.join(OUT, fmt), { recursive: true });
    await pg.setViewportSize({ width: W, height: H });
    for (let i = 0; i < POSTS.length; i++) {
      const p = POSTS[i], nr = String(i + 1).padStart(2, "0");
      const bild = p.team
        ? `<div class="team" style="background-image:url('file://${TEAM}/${p.team}');background-position:${p.pos}"></div><div class="team-tint"></div><div class="team-glow"></div>`
        : `<div class="bild" style="background-image:url('file://${D}/roh/${p.roh}.png')"></div>`;
      fs.writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><style>:root{--w:${W}px;--h:${H}px}${CSS}</style></head><body>${bild}
        <div class="text${p.team ? " unten" : ""}"><span class="k">${p.k}</span><h1>${p.h.map(z => `<span>${z.replace(/==(.+?)==/g, "<em>$1</em>")}</span>`).join("")}</h1><p class="t">${p.t}</p></div>
        <div class="fuss"><img src="file://${IMG}/fachkraefte-kompass-logo-weiss.png"><span>${nr} / 09</span></div></body></html>`);
      await pg.goto("file://" + tmp); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(120);
      await pg.screenshot({ path: path.join(OUT, fmt, `fk-${nr}-${fmt}.jpg`), type: "jpeg", quality: 93 });
    }
  }
  fs.unlinkSync(tmp); await b.close(); console.log("fertig");
})();
