// 6 Team-Posts „Wer wir sind & was wir machen“ (4:5, 1080×1350) in den Markenfarben:
// große Aussage oben, echtes Teamfoto, darüber eine Infokarte mit dem konkreten Inhalt.
// Aufruf: node werbung/insta-team/bauen.cjs → fertig/
const fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const D = __dirname, OUT = path.join(D, "fertig");
const IMG = path.join(D, "..", "posts", "img"), TEAM = path.join(D, "..", "insta-posts", "team-hd");
fs.mkdirSync(OUT, { recursive: true });
const W = 1080, H = 1350;
const POSTS = [
  { bild: "team-gruppe.jpg", pos: "35% 35%", k: "Wer wir sind", h: ["Wir finden den Job,", "==der zu dir passt.=="],
    liste: ["Einstellungspartner statt Jobportal", "Persönlicher Ansprechpartner", "Für dich komplett kostenlos"] },
  { bild: "team-ansprechpartner.jpg", pos: "50% 30%", k: "Dein Ansprechpartner", h: ["Ein Ansprechpartner.", "==Von Anfang an.=="],
    liste: ["Eine feste Kontaktperson für dich", "Erreichbar per WhatsApp und Telefon", "Begleitung bis zum neuen Vertrag"] },
  { bild: "team-headset.jpg", pos: "50% 42%", k: "Das erste Gespräch", h: ["Erst zuhören.", "==Dann suchen.=="],
    titel: "Wir klären mit dir:", liste: ["Was du kannst – und was du machen willst", "Gehalt, Fahrweg und Arbeitszeiten", "Was dir im neuen Job wirklich wichtig ist"] },
  { bild: "team-laptop.jpg", pos: "50% 52%", k: "Was wir machen", h: ["Wir suchen.", "==Du lehnst dich zurück.=="],
    liste: ["Abgleich mit Betrieben in deiner Nähe", "Nur Jobs, die wirklich zu dir passen", "Du entscheidest, wer dein Profil sieht"] },
  { bild: "team-handy.jpg", pos: "50% 30%", k: "So läuft's ab", h: ["Neuer Job.", "==In 3 Schritten.=="],
    schritte: [["Kurzprofil anlegen", "2 Minuten, ohne Lebenslauf"], ["Wir melden uns", "Per WhatsApp und Telefon"], ["Du entscheidest", "Erst dein Ja – dann geht's los"]] },
  { bild: "team-gruppe.jpg", pos: "78% 72%", gr: "165%", k: "Dein nächster Schritt", h: ["Dein neuer Job", "==beginnt hier.=="],
    liste: ["In 2 Minuten eingetragen", "Ohne Lebenslauf, ohne Anschreiben", "100 % vertraulich – dein Chef erfährt nichts"], cta: true }
];
const CSS = `@font-face{font-family:PJS;font-weight:400 800;src:url("file://${IMG}/plus-jakarta-sans-var.woff2") format("woff2")}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden;font-family:PJS,sans-serif;color:#fff;background:#0F1B2D;-webkit-font-smoothing:antialiased}
.bg{position:absolute;inset:0;background:radial-gradient(75% 45% at 100% 0%,rgba(43,89,195,.75),transparent 70%),radial-gradient(70% 45% at 0% 100%,rgba(43,89,195,.4),transparent 70%),linear-gradient(180deg,#13233D 0%,#0B1526 100%)}
.linien{position:absolute;inset:0;background-image:linear-gradient(rgba(127,162,240,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(127,162,240,.06) 1px,transparent 1px);background-size:54px 54px;-webkit-mask-image:radial-gradient(80% 60% at 70% 20%,#000,transparent 75%)}
.korn{position:absolute;inset:0;opacity:.06;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
.kopf{position:absolute;left:72px;right:72px;top:70px}
.k{display:inline-flex;align-items:center;gap:12px;font-size:22px;font-weight:800;letter-spacing:.22em;text-transform:uppercase;color:#7FA2F0;padding:12px 22px;border:1.5px solid rgba(127,162,240,.5);border-radius:999px;background:rgba(43,89,195,.15)}
.k:before{content:"";width:9px;height:9px;border-radius:50%;background:#7FA2F0;box-shadow:0 0 12px #7FA2F0}
h1{font-size:82px;font-weight:800;letter-spacing:-.04em;line-height:1.02;margin-top:26px}
h1 span{display:block} h1 em{font-style:normal;background:linear-gradient(90deg,#7FA2F0,#A9C1F7);-webkit-background-clip:text;color:transparent}
.nr{position:absolute;right:72px;top:84px;font-size:22px;font-weight:700;letter-spacing:.16em;color:rgba(255,255,255,.45)}
.foto{position:absolute;left:72px;right:72px;top:420px;height:620px;border-radius:36px;background-size:cover;border:1.5px solid rgba(127,162,240,.4);box-shadow:0 40px 90px -20px rgba(43,89,195,.65),0 10px 30px rgba(0,0,0,.35)}
.foto:after{content:"";position:absolute;inset:0;border-radius:36px;background:linear-gradient(180deg,rgba(15,27,45,0) 55%,rgba(15,27,45,.55) 100%)}
.karte{position:absolute;left:112px;right:112px;top:985px;padding:22px 36px;border-radius:30px;background:rgba(14,26,46,.86);backdrop-filter:blur(14px);border:1.5px solid rgba(127,162,240,.35);box-shadow:0 30px 70px rgba(0,0,0,.45)}
.karte .titel{font-size:22px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#7FA2F0;margin-bottom:14px}
.p{display:flex;align-items:center;gap:18px;font-size:28px;font-weight:600;line-height:1.22;padding:9px 0}
.p+.p{border-top:1px solid rgba(255,255,255,.08)}
.p i{flex:0 0 40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#7FA2F0,#2B59C3);display:grid;place-items:center;font-style:normal;font-size:20px;font-weight:800;color:#fff;box-shadow:0 0 18px rgba(127,162,240,.45)}
.p small{display:inline;font-size:22px;margin-left:10px;font-weight:500;color:#A3AEBF;margin-top:2px}
.fuss{position:absolute;left:72px;right:72px;bottom:44px;display:flex;align-items:center;justify-content:space-between}
.fuss img{height:32px}.fuss span{font-size:24px;font-weight:700;color:#7FA2F0}
.cta{background:linear-gradient(135deg,#7FA2F0,#5A85E6);color:#0F1B2D !important;padding:16px 28px;border-radius:999px;box-shadow:0 12px 30px rgba(127,162,240,.35)}`;
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: W, height: H } });
  const tmp = path.join(D, "_tmp.html");
  for (let i = 0; i < POSTS.length; i++) {
    const p = POSTS[i], nr = String(i + 1).padStart(2, "0");
    const inhalt = p.schritte
      ? p.schritte.map((s, j) => `<div class="p"><i>${j + 1}</i><div>${s[0]}<small>${s[1]}</small></div></div>`).join("")
      : p.liste.map(x => `<div class="p"><i>✓</i><div>${x}</div></div>`).join("");
    fs.writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
      <div class="bg"></div><div class="linien"></div><div class="korn"></div>
      <div class="kopf"><span class="k">${p.k}</span><h1>${p.h.map(z => `<span>${z.replace(/==(.+?)==/g, "<em>$1</em>")}</span>`).join("")}</h1></div>
      <span class="nr">${nr} / 06</span>
      <div class="foto" style="background-image:url('file://${TEAM}/${p.bild}');background-position:${p.pos};background-size:${p.gr || "cover"}"></div>
      <div class="karte">${p.titel ? `<div class="titel">${p.titel}</div>` : ""}${inhalt}</div>
      <div class="fuss"><img src="file://${IMG}/fachkraefte-kompass-logo-weiss.png"><span class="${p.cta ? "cta" : ""}">${p.cta ? "Kurzprofil anlegen – Link in der Bio" : "Link in der Bio"}</span></div></body></html>`);
    await pg.goto("file://" + tmp); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(150);
    await pg.screenshot({ path: path.join(OUT, `fk-team-${nr}.jpg`), type: "jpeg", quality: 93 });
  }
  fs.unlinkSync(tmp); await b.close(); console.log("fertig");
})();
