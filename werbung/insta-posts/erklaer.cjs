// 3 Erklär-Karussells zum Anpinnen (3:4, 1080×1440): Was ist FK? · So funktioniert's · Für wen?
// Aufruf: node werbung/insta-posts/erklaer.cjs → fertig-erklaer/
const fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const D = __dirname, OUT = path.join(D, "fertig-erklaer");
const IMG = path.join(D, "..", "posts", "img"), KI = path.join(D, "..", "ki-v3", "roh"), HD = path.join(D, "team-hd"), WEB = path.join(D, "..", "..", "assets");
fs.mkdirSync(OUT, { recursive: true });
const W = 1080, H = 1440;
const berufe = JSON.parse(fs.readFileSync(path.join(D, "..", "..", "config", "berufe.json"), "utf8"));
const em = z => z.replace(/==(.+?)==/g, "<em>$1</em>");
const zeilen = a => a.map(z => `<span>${em(z)}</span>`).join("");

const CSS = `@font-face{font-family:PJS;font-weight:400 800;src:url("file://${IMG}/plus-jakarta-sans-var.woff2") format("woff2")}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden;font-family:PJS,sans-serif;color:#fff;background:#0F1B2D;-webkit-font-smoothing:antialiased}
.bild{position:absolute;inset:0;background-size:cover;background-repeat:no-repeat}
.korn{position:absolute;inset:0;opacity:.07;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
.glow{position:absolute;inset:0;background:radial-gradient(70% 45% at 100% 0%,rgba(43,89,195,.45),transparent 70%),radial-gradient(60% 40% at 0% 100%,rgba(43,89,195,.25),transparent 70%)}
.verlauf{position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,18,32,.35) 0%,rgba(11,18,32,0) 20%,rgba(11,18,32,0) 40%,rgba(11,18,32,.85) 68%,rgba(11,18,32,.97) 100%)}
.marke{position:absolute;left:80px;bottom:72px;height:30px}
.seite{position:absolute;right:80px;bottom:74px;font-size:22px;font-weight:600;letter-spacing:.18em;color:rgba(255,255,255,.6)}
.wisch{position:absolute;right:80px;bottom:74px;font-size:24px;font-weight:700;letter-spacing:.06em;color:#7FA2F0}
.kicker{display:flex;align-items:center;gap:18px;font-size:24px;font-weight:700;letter-spacing:.32em;text-transform:uppercase;color:#7FA2F0}
.kicker:before{content:"";width:56px;height:3px;background:#7FA2F0}
h1{font-weight:800;letter-spacing:-.045em;line-height:.95;margin-top:30px}
h1 span{display:block} h1 em{font-style:normal;color:#7FA2F0}
.unter{font-weight:500;font-size:34px;line-height:1.4;color:rgba(255,255,255,.82);margin-top:34px;max-width:860px}
.oben{position:absolute;left:80px;right:80px;top:150px}
.unten{position:absolute;left:80px;right:80px;bottom:170px}`;
const fuss = (nr, gesamt, wisch = true) => `<img class="marke" src="file://${IMG}/fachkraefte-kompass-logo-weiss.png">` +
  (wisch && nr < gesamt ? `<span class="wisch">Weiter →</span>` : `<span class="seite">${String(nr).padStart(2, "0")} / ${String(gesamt).padStart(2, "0")}</span>`);

/* --- Folientypen --- */
const cover = (o) => (nr, g) => `${`<div class="bild" style="background-image:url('file://${o.bild}');background-position:${o.pos || "center 30%"}"></div>`}<div class="verlauf"></div><div class="korn"></div>
  <div class="unten"><div class="kicker">${o.kicker}</div><h1 style="font-size:${o.gr || 108}px">${zeilen(o.h)}</h1>${o.unter ? `<p class="unter">${o.unter}</p>` : ""}</div>${fuss(nr, g)}`;
const aussage = (o) => (nr, g) => `${o.bild ? `<div class="bild" style="top:auto;height:620px;background-image:url('file://${o.bild}');background-position:${o.pos || "center 40%"}"></div><div style="position:absolute;left:0;right:0;bottom:0;height:620px;background:linear-gradient(180deg,#0F1B2D 0%,rgba(15,27,45,.35) 35%,rgba(15,27,45,.2) 60%,rgba(15,27,45,.85) 100%)"></div>` : ""}<div class="glow"></div><div class="korn"></div>
  <div class="oben"><div class="kicker">${o.kicker}</div><h1 style="font-size:${o.gr || 100}px">${zeilen(o.h)}</h1><p class="unter" style="font-size:38px;margin-top:56px">${o.text}</p></div>${fuss(nr, g)}`;
const vergleich = (o) => (nr, g) => `<style>.tab{position:absolute;left:80px;right:80px;top:470px}
  .kopf,.zeile{display:grid;grid-template-columns:1fr 1fr;gap:28px}
  .kopf div{font-size:24px;font-weight:700;letter-spacing:.24em;text-transform:uppercase;color:rgba(255,255,255,.5);padding-bottom:22px}
  .kopf div:last-child{color:#7FA2F0}
  .zeile{border-top:1px solid rgba(255,255,255,.14);padding:30px 0}
  .zeile div{font-size:34px;font-weight:600;line-height:1.25;color:rgba(255,255,255,.5);text-decoration:line-through;text-decoration-color:rgba(255,255,255,.3)}
  .zeile div:last-child{color:#fff;text-decoration:none;font-weight:700}
  .zeile div:last-child:before{content:"✓  ";color:#7FA2F0}</style>
  <div class="glow"></div><div class="korn"></div>
  <div class="oben"><div class="kicker">${o.kicker}</div><h1 style="font-size:92px">${zeilen(o.h)}</h1></div>
  <div class="tab"><div class="kopf"><div>Jobportal</div><div>Fachkräfte Kompass</div></div>
  ${o.zeilen.map(([a, b]) => `<div class="zeile"><div>${a}</div><div>${b}</div></div>`).join("")}</div>${fuss(nr, g)}`;
const zahlen = (o) => (nr, g) => `<style>.z{position:absolute;left:80px;right:80px;top:450px;display:flex;flex-direction:column}
  .z div{border-top:1px solid rgba(255,255,255,.14);padding:34px 0;display:grid;grid-template-columns:330px 1fr;align-items:center}
  .z b{font-size:110px;font-weight:800;letter-spacing:-.05em;color:#7FA2F0;line-height:1}
  .z span{font-size:36px;font-weight:600;line-height:1.3;color:rgba(255,255,255,.88)}</style>
  <div class="glow"></div><div class="korn"></div>
  <div class="oben"><div class="kicker">${o.kicker}</div><h1 style="font-size:92px">${zeilen(o.h)}</h1></div>
  <div class="z">${o.zahlen.map(([a, b]) => `<div><b>${a}</b><span>${b}</span></div>`).join("")}</div>${fuss(nr, g)}`;
const schritt = (o) => (nr, g) => `<style>.gross{position:absolute;right:40px;top:40px;font-size:560px;font-weight:800;letter-spacing:-.06em;line-height:1;color:transparent;-webkit-text-stroke:3px rgba(127,162,240,.35)}</style>
  <div class="glow"></div><div class="korn"></div><div class="gross">${o.nr}</div>
  <div class="unten" style="bottom:200px"><div class="kicker">Schritt ${o.nr}</div><h1 style="font-size:104px">${zeilen(o.h)}</h1><p class="unter" style="font-size:38px">${o.text}</p></div>${fuss(nr, g)}`;
const collage = (o) => (nr, g) => `<style>.raster{position:absolute;inset:0;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(4,1fr);gap:6px}
  .raster div{background-size:cover;background-position:center}</style>
  <div class="raster">${o.bilder.map(b => `<div style="background-image:url('file://${b}')"></div>`).join("")}</div>
  <div class="verlauf" style="background:linear-gradient(180deg,rgba(11,18,32,.2) 0%,rgba(11,18,32,.25) 35%,rgba(11,18,32,.9) 62%,rgba(11,18,32,.98) 100%)"></div><div class="korn"></div>
  <div class="unten"><div class="kicker">${o.kicker}</div><h1 style="font-size:104px">${zeilen(o.h)}</h1>${o.unter ? `<p class="unter">${o.unter}</p>` : ""}</div>${fuss(nr, g)}`;
const bereiche = (o) => (nr, g) => `<style>.chips{position:absolute;left:80px;right:80px;top:470px;display:flex;flex-wrap:wrap;gap:16px}
  .chips span{border:2px solid rgba(127,162,240,.45);border-radius:999px;padding:16px 26px;font-size:30px;font-weight:600;color:#fff;background:rgba(127,162,240,.08)}</style>
  <div class="glow"></div><div class="korn"></div>
  <div class="oben"><div class="kicker">${o.kicker}</div><h1 style="font-size:92px">${zeilen(o.h)}</h1></div>
  <div class="chips">${o.chips.map(c => `<span>${c}</span>`).join("")}</div>${fuss(nr, g)}`;

const KARUSSELLS = {
  "1-was-ist-fk": [
    cover({ bild: `${HD}/team-ansprechpartner.jpg`, pos: "center 25%", kicker: "Neu hier?", h: ["Was ist", "==Fachkräfte Kompass?=="], unter: "Kurz erklärt – wisch einfach durch." }),
    aussage({ bild: `${HD}/team-laptop.jpg`, pos: "center 55%", kicker: "Wer wir sind", h: ["Wir finden den Job,", "==der zu dir passt.=="], text: "Wir sind dein Einstellungspartner. Du sagst uns einmal, was du kannst und was du willst – wir suchen für dich den passenden Betrieb. In deiner Nähe und in ganz Deutschland." }),
    vergleich({ kicker: "Der Unterschied", h: ["Kein Jobportal.", "==Dein Partner.=="], zeilen: [["Du suchst selbst", "Wir suchen für dich"], ["Lebenslauf und Anschreiben", "Kurzprofil in 2 Minuten"], ["Bewerbung ins Leere", "Ein echter Mensch ruft an"], ["Jeder kann's sehen", "100 % vertraulich"]] }),
    zahlen({ kicker: "Auf einen Blick", h: ["Einfach.", "==Ehrlich. Kostenlos.=="], zahlen: [["0 €", "Für dich komplett kostenlos"], ["2 Min.", "Kurzprofil – ohne Lebenslauf"], ["15", "Bereiche – vom Handwerk bis zum Büro"]] }),
    cover({ bild: `${HD}/team-gruppe.jpg`, pos: "30% center", kicker: "Bereit?", h: ["Dein nächster Job", "==wartet schon.=="], unter: "Link in der Bio – Kurzprofil anlegen. Wir melden uns." })
  ],
  "2-so-funktionierts": [
    cover({ bild: `${KI}/ausbruch.png`, pos: "center 15%", kicker: "So funktioniert's", h: ["Neuer Job.", "==In 4 Schritten.=="], unter: "Ohne Lebenslauf. Ohne Stress." }),
    schritt({ nr: "01", h: ["Kurzprofil", "==anlegen.=="], text: "Beruf, Tätigkeit, Wohnort. 2 Minuten – ohne Lebenslauf, ohne Anschreiben." }),
    schritt({ nr: "02", h: ["Kurz per", "==WhatsApp.=="], text: "Wir schreiben dir und stellen ein paar kurze Fragen. Dauert keine 2 Minuten." }),
    schritt({ nr: "03", h: ["Wir", "==telefonieren.=="], text: "Ein echter Mensch ruft dich an und hört zu, was dir wirklich wichtig ist." }),
    schritt({ nr: "04", h: ["Du", "==entscheidest.=="], text: "Wir stellen dir passende Betriebe vor. Erst wenn du Ja sagst, geht dein Profil raus." }),
    cover({ bild: `${HD}/team-headset.jpg`, pos: "center 20%", kicker: "Los geht's", h: ["Fang mit", "==Schritt 1 an.=="], unter: "Link in der Bio. Wir freuen uns auf dich." })
  ],
  "3-fuer-wen": [
    collage({ bilder: ["metall", "elektro", "buero", "lager", "shk", "it", "kfz", "bau", "vertrieb", "produktion", "fahrer", "technik"].map(k => `${WEB}/beruf-${k}.jpg`), kicker: "Für wen?", h: ["Für alle,", "==die mehr wollen.=="], unter: "Handwerk, Technik, Lager, Büro – und mehr." }),
    bereiche({ kicker: "15 Bereiche", h: ["Dein Bereich", "==ist dabei.=="], chips: berufe.map(b => b.name) }),
    aussage({ bild: `${KI}/ausbruch-quer.png`, pos: "right 30%", kicker: "Egal wo du stehst", h: ["Fachkraft, Helfer", "oder Quereinsteiger:", "==Du bist richtig.=="], gr: 88, text: "Ob du schon weißt, was du willst, oder einfach mal schauen möchtest – wir finden heraus, was zu dir passt. Kostenlos und vertraulich." }),
    cover({ bild: `${KI}/gehalt.png`, pos: "center 40%", kicker: "Jetzt du", h: ["Was ist", "==dein nächster Schritt?=="], unter: "Link in der Bio – in 2 Minuten eingetragen." })
  ]
};

(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: W, height: H } });
  const tmp = path.join(D, "_tmp.html");
  for (const [name, folien] of Object.entries(KARUSSELLS)) {
    fs.mkdirSync(path.join(OUT, name), { recursive: true });
    for (let i = 0; i < folien.length; i++) {
      fs.writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${folien[i](i + 1, folien.length)}</body></html>`);
      await pg.goto("file://" + tmp); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(120);
      await pg.screenshot({ path: path.join(OUT, name, `${name}-${String(i + 1).padStart(2, "0")}.jpg`), type: "jpeg", quality: 92 });
    }
  }
  fs.unlinkSync(tmp); await b.close(); console.log("fertig");
})();
