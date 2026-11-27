// 6 Team-Posts „Wer wir sind & was wir machen“ (4:5, 1080×1350) in den Markenfarben:
// große Aussage oben, echtes Teamfoto, darüber eine Infokarte mit dem konkreten Inhalt.
// Aufruf: node werbung/insta-team/bauen.cjs → fertig/
const fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const D = __dirname, OUT = path.join(D, "fertig");
const IMG = path.join(D, "..", "posts", "img"), TEAM = path.join(D, "..", "insta-posts", "team-hd"), FOTOS = path.join(D, "fotos");
fs.mkdirSync(OUT, { recursive: true });
const W = 1080, H = 1350;
const POSTS = [
  { bild: `${FOTOS}/gruppe-2.jpg`, pos: "40% 30%", k: "Wer wir sind", h: ["Wir finden den Job,", "==der zu dir passt.=="],
    liste: ["Einstellungspartner statt Jobportal", "Persönlicher Ansprechpartner", "Für dich komplett kostenlos"] },
  { bild: `${TEAM}/team-ansprechpartner.jpg`, pos: "50% 30%", k: "Dein Ansprechpartner", h: ["Ein Ansprechpartner.", "==Von Anfang an.=="],
    liste: ["Eine feste Kontaktperson für dich", "Erreichbar per WhatsApp und Telefon", "Begleitung bis zum neuen Vertrag"] },
  { bild: `${FOTOS}/headset-2.jpg`, pos: "35% 48%", k: "Das erste Gespräch", h: ["Erst zuhören.", "==Dann suchen.=="],
    titel: "Wir klären mit dir:", liste: ["Was du kannst – und was du machen willst", "Gehalt, Fahrweg und Arbeitszeiten", "Was dir im neuen Job wirklich wichtig ist"] },
  { bild: `${FOTOS}/headset-3.jpg`, pos: "50% 45%", k: "Was wir machen", h: ["Wir suchen.", "==Du lehnst dich zurück.=="],
    liste: ["Abgleich mit Betrieben in deiner Nähe", "Nur Jobs, die wirklich zu dir passen", "Du entscheidest, wer dein Profil sieht"] },
  { bild: `${FOTOS}/laptop-2.jpg`, pos: "50% 40%", k: "So läuft's ab", h: ["Neuer Job.", "==In 3 Schritten.=="],
    schritte: [["Kurzprofil anlegen", "2 Minuten, ohne Lebenslauf"], ["Wir melden uns", "Per WhatsApp und Telefon"], ["Du entscheidest", "Erst dein Ja – dann geht's los"]] },
  { bild: `${FOTOS}/gruppe-2.jpg`, pos: "85% 75%", gr: "150%", k: "Dein nächster Schritt", h: ["Dein neuer Job", "==beginnt hier.=="],
    liste: ["In 2 Minuten eingetragen", "Ohne Lebenslauf, ohne Anschreiben", "100 % vertraulich – dein Chef erfährt nichts"], cta: true }
];
const CSS = `@font-face{font-family:PJS;font-weight:400 800;src:url("file://${IMG}/plus-jakarta-sans-var.woff2") format("woff2")}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden;font-family:PJS,sans-serif;color:#fff;background:#0F1B2D;-webkit-font-smoothing:antialiased}
.bg{position:absolute;inset:0;background:#0F1B2D}
.linien{display:none}
.korn{position:absolute;inset:0;opacity:.035;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
.kopf{position:absolute;left:72px;right:72px;top:70px}
.k{display:inline-block;font-size:22px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#0F1B2D;padding:12px 22px;border-radius:10px;background:#7FA2F0}

h1{font-size:82px;font-weight:800;letter-spacing:-.04em;line-height:1.02;margin-top:26px}
h1 span{display:block} h1 em{font-style:normal;color:#7FA2F0}
.nr{position:absolute;right:72px;top:84px;font-size:22px;font-weight:700;letter-spacing:.16em;color:rgba(255,255,255,.45)}
.foto{position:absolute;left:72px;right:72px;top:420px;height:620px;border-radius:36px;background-size:cover;box-shadow:0 24px 50px rgba(0,0,0,.35)}

.karte{position:absolute;left:112px;right:112px;top:985px;padding:22px 36px;border-radius:30px;background:#16263F;border:1.5px solid rgba(255,255,255,.08);box-shadow:0 24px 50px rgba(0,0,0,.4)}
.karte .titel{font-size:22px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#7FA2F0;margin-bottom:14px}
.p{display:flex;align-items:center;gap:18px;font-size:28px;font-weight:600;line-height:1.22;padding:9px 0}
.p+.p{border-top:1px solid rgba(255,255,255,.08)}
.p i{flex:0 0 40px;height:40px;border-radius:50%;background:#7FA2F0;display:grid;place-items:center;font-style:normal;font-size:20px;font-weight:800;color:#0F1B2D}
.p small{display:inline;font-size:22px;margin-left:10px;font-weight:500;color:#A3AEBF;margin-top:2px}
.fuss{position:absolute;left:72px;right:72px;bottom:44px;display:flex;align-items:center;justify-content:space-between}
.fuss img{height:32px}.fuss span{font-size:24px;font-weight:700;color:#7FA2F0}
.cta{background:#7FA2F0;color:#0F1B2D !important;padding:16px 28px;border-radius:999px}`;
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
      <div class="foto" style="background-image:url('file://${p.bild}');background-position:${p.pos};background-size:${p.gr || "cover"}"></div>
      <div class="karte">${p.titel ? `<div class="titel">${p.titel}</div>` : ""}${inhalt}</div>
      <div class="fuss"><img src="file://${IMG}/fachkraefte-kompass-logo-weiss.png"><span class="${p.cta ? "cta" : ""}">${p.cta ? "Kurzprofil anlegen – Link in der Bio" : "Link in der Bio"}</span></div></body></html>`);
    await pg.goto("file://" + tmp); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(150);
    await pg.screenshot({ path: path.join(OUT, `fk-team-${nr}.jpg`), type: "jpeg", quality: 93 });
  }
  fs.unlinkSync(tmp); await b.close(); console.log("fertig");
})();
