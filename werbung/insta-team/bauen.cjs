// 9 Team-Posts „Wer wir sind & was wir machen“ (4:5, 1080×1350), einheitliches Nachtblau + Hellblau.
// 5 Layouts für Abwechslung: karte · panel · split · zitat · zahlen
// Aufruf: node werbung/insta-team/bauen.cjs → fertig/
const fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const D = __dirname, OUT = path.join(D, "fertig");
const IMG = path.join(D, "..", "posts", "img"), TEAM = path.join(D, "..", "insta-posts", "team-hd"), F = path.join(D, "fotos");
fs.mkdirSync(OUT, { recursive: true });
const W = 1080, H = 1350, N = 11;
const em = z => z.replace(/==(.+?)==/g, "<em>$1</em>");
const h1 = (a, gr, lw) => `<h1 style="${gr ? `font-size:${gr}px;` : ""}${lw ? `letter-spacing:${lw}em;line-height:1.08;` : ""}">${a.map(z => `<span>${em(z)}</span>`).join("")}</h1>`;
const haken = l => l.map(x => `<div class="p"><i>✓</i><div>${x}</div></div>`).join("");

const POSTS = [
  { lay: "karte", fs: 74, lw: -0.025, bild: `${F}/gruppe-2.jpg`, pos: "40% 30%", k: "Wer wir sind", h: ["Wir finden den Job,", "==der zu dir passt.=="], liste: ["Einstellungspartner statt Jobportal", "Persönlicher Ansprechpartner", "Für dich komplett kostenlos"] },
  { lay: "zitat", bild: `${TEAM}/team-ansprechpartner.jpg`, pos: "50% 22%", k: "Dein Ansprechpartner", zitat: "Ich begleite dich vom ersten Gespräch bis zum neuen Vertrag.", h: ["Ein Ansprechpartner.", "==Von Anfang an.=="] },
  { lay: "panel", bild: `${F}/duo.jpg`, pos: "55% 42%", k: "Das erste Gespräch", h: ["Erst zuhören.", "==Dann suchen.=="], t: "Was kannst du, was willst du, was ist dir wichtig? Darum geht's im ersten Gespräch." },
  { lay: "split", bild: `${F}/headset-3.jpg`, pos: "45% 40%", k: "Was wir machen", fs: 70, lw: -0.025, h: ["Wir suchen", "==für dich.=="], liste: ["Betriebe in deiner Nähe", "Nur passende Jobs", "Du entscheidest"] },
  { lay: "zahlen", bild: `${TEAM}/team-laptop.jpg`, pos: "60% 45%", k: "Auf einen Blick", fs: 74, lw: -0.025, zgr: 86, h: ["Einfach.", "==Für dich gemacht.=="], zahlen: [["0 €", "für dich – komplett kostenlos"], ["2 Min.", "Kurzprofil, ohne Lebenslauf"], ["100 %", "vertraulich – dein Chef erfährt nichts"]] },
  { lay: "karte", bild: `${F}/headset-2.jpg`, pos: "40% 45%", k: "Hinter den Kulissen", h: ["Wir gleichen ab.", "==Du lehnst dich zurück.=="], liste: ["Dein Profil trifft passende Stellen", "Wir prüfen jeden Vorschlag persönlich", "Du bekommst nur, was wirklich passt"] },
  { lay: "panel", bild: `${F}/handy-2.jpg`, pos: "50% 32%", k: "So erreichst du uns", h: ["Wir melden uns.", "==Schnell und persönlich.=="], t: "Nach deinem Kurzprofil schreiben wir dir per WhatsApp – und rufen kurz an." },
  { lay: "karte", bild: `${F}/laptop-2.jpg`, pos: "50% 40%", k: "So läuft's ab", h: ["Neuer Job.", "==In 3 Schritten.=="], schritte: [["Kurzprofil anlegen", "2 Minuten, ohne Lebenslauf"], ["Wir melden uns", "Per WhatsApp und Telefon"], ["Du entscheidest", "Erst dein Ja – dann geht's los"]] },
  { lay: "karte", bild: `${F}/gruppe-2.jpg`, pos: "85% 75%", gr: "150%", k: "Dein nächster Schritt", h: ["Dein neuer Job", "==beginnt hier.=="], liste: ["In 2 Minuten eingetragen", "Ohne Lebenslauf, ohne Anschreiben", "100 % vertraulich – dein Chef erfährt nichts"], cta: true },
  { lay: "zitat", bild: `${F}/laptop-2.jpg`, pos: "50% 30%", k: "Unser Anspruch", zitat: "Wir wissen, wie sich ein Jobwechsel anfühlt – und machen ihn dir so leicht wie möglich.", h: ["Ehrlich. Persönlich.", "==Auf Augenhöhe.=="] },
  { lay: "panel", bild: `${F}/gruppe-2.jpg`, pos: "22% 30%", gr: "160%", k: "Gut zu wissen", h: ["Erst kündigen,", "==wenn der Neue steht.=="], t: "Wir suchen, während du noch im alten Job bist – ohne Risiko, ohne Stress." }
];

const CSS = `@font-face{font-family:PJS;font-weight:400 800;src:url("file://${IMG}/plus-jakarta-sans-var.woff2") format("woff2")}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden;font-family:PJS,sans-serif;color:#fff;background:#0F1B2D;-webkit-font-smoothing:antialiased}
.k{display:inline-block;font-size:22px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#0F1B2D;padding:12px 22px;border-radius:10px;background:#7FA2F0}
h1{font-size:82px;font-weight:800;letter-spacing:-.04em;line-height:1.02;margin-top:26px}
h1 span{display:block} h1 em{font-style:normal;color:#7FA2F0}
.t{font-size:30px;font-weight:500;line-height:1.4;color:#C9D3E3;margin-top:20px}
.nr{position:absolute;right:72px;top:84px;font-size:22px;font-weight:700;letter-spacing:.16em;color:rgba(255,255,255,.45)}
.foto{position:absolute;background-size:cover;border-radius:32px;box-shadow:0 24px 50px rgba(0,0,0,.35)}
.karte{position:absolute;padding:22px 36px;border-radius:28px;background:#16263F;border:1.5px solid rgba(255,255,255,.08);box-shadow:0 24px 50px rgba(0,0,0,.4)}
.p{display:flex;align-items:center;gap:18px;font-size:28px;font-weight:600;line-height:1.22;padding:9px 0}
.p+.p{border-top:1px solid rgba(255,255,255,.08)}
.p i{flex:0 0 40px;height:40px;border-radius:50%;background:#7FA2F0;display:grid;place-items:center;font-style:normal;font-size:20px;font-weight:800;color:#0F1B2D}
.fuss{position:absolute;left:72px;right:72px;bottom:44px;display:flex;align-items:center;justify-content:space-between;z-index:5}
.fuss img{height:32px}.fuss span{font-size:24px;font-weight:700;color:#7FA2F0}
.cta{background:#7FA2F0;color:#0F1B2D !important;padding:16px 28px;border-radius:999px}`;

function layout(p) {
  const bg = (x) => `background-image:url('file://${p.bild}');background-position:${p.pos};background-size:${p.gr || "cover"};${x}`;
  if (p.lay === "karte") return `<div style="position:absolute;left:72px;right:72px;top:70px"><span class="k">${p.k}</span>${h1(p.h, p.fs, p.lw)}</div>
    <div class="foto" style="${bg("left:72px;right:72px;top:420px;height:620px")}"></div>
    <div class="karte" style="left:112px;right:112px;top:985px">${p.schritte ? p.schritte.map((x, i) => `<div class="p"><i>${i + 1}</i><div>${x[0]} <span style="font-size:22px;font-weight:500;color:#A3AEBF;margin-left:8px">${x[1]}</span></div></div>`).join("") : haken(p.liste)}</div>`;
  if (p.lay === "panel") return `<div class="foto" style="${bg("left:0;right:0;top:0;height:780px;border-radius:0 0 48px 48px")}"></div>
    <div style="position:absolute;left:72px;top:64px"><span class="k">${p.k}</span></div>
    <div style="position:absolute;left:72px;right:72px;top:830px">${h1(p.h, 80).replace("margin-top", "x")}${p.t ? `<p class="t">${p.t}</p>` : ""}
    ${p.schritte ? `<div style="display:flex;gap:16px;margin-top:30px">${p.schritte.map((s, i) => `<div style="flex:1;background:#16263F;border:1.5px solid rgba(255,255,255,.08);border-radius:22px;padding:20px 22px"><div style="font-size:44px;font-weight:800;color:#7FA2F0;line-height:1">0${i + 1}</div><div style="font-size:26px;font-weight:700;margin-top:10px;line-height:1.2">${s}</div></div>`).join("")}</div>` : ""}</div>`;
  if (p.lay === "split") { const l = p.rechts ? "right:0" : "left:0", t = p.rechts ? "left:72px" : "left:600px";
    return `<div class="foto" style="${bg(`${l};top:0;bottom:0;width:520px;border-radius:${p.rechts ? "48px 0 0 48px" : "0 48px 48px 0"}`)}"></div>
    <div style="position:absolute;${t};width:420px;top:300px"><span class="k">${p.k}</span>${h1(p.h, p.fs || 92, p.lw)}
      <div style="margin-top:44px">${haken(p.liste)}</div></div>
    <img src="file://${IMG}/fachkraefte-kompass-logo-weiss.png" style="position:absolute;${t};bottom:50px;height:32px">`; }
  if (p.lay === "zitat") return `<div style="position:absolute;left:72px;right:72px;top:70px"><span class="k">${p.k}</span>${h1(p.h, 76)}</div>
    <div style="position:absolute;left:72px;top:420px;width:440px;height:720px;border-radius:220px 220px 32px 32px;${bg("")}box-shadow:0 24px 50px rgba(0,0,0,.35)"></div>
    <div class="karte" style="left:470px;right:72px;top:700px;padding:40px 40px 36px">
      <div style="font-size:120px;line-height:.6;font-weight:800;color:#7FA2F0;height:56px">“</div>
      <div style="font-size:36px;font-weight:700;line-height:1.3">${p.zitat}</div>
      <div style="margin-top:22px;font-size:22px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#7FA2F0">Fachkräfte Kompass Team</div></div>`;
  if (p.lay === "zahlen") return `<div style="position:absolute;left:72px;right:72px;top:70px"><span class="k">${p.k}</span>${h1(p.h, p.fs, p.lw)}</div>
    <div class="foto" style="${bg("right:72px;top:420px;width:340px;height:640px")}"></div>
    <div style="position:absolute;left:72px;width:540px;top:420px">${p.zahlen.map(([a, b]) => `<div style="padding:26px 0;border-bottom:1px solid rgba(255,255,255,.1)"><div style="font-size:${p.zgr || 104}px;font-weight:800;letter-spacing:-.025em;line-height:1;color:#7FA2F0">${a}</div><div style="font-size:28px;font-weight:600;margin-top:8px;color:#E8ECF2">${b}</div></div>`).join("")}</div>`;
}
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: W, height: H } });
  const tmp = path.join(D, "_tmp.html");
  fs.readdirSync(OUT).forEach(f => fs.unlinkSync(path.join(OUT, f)));
  for (let i = 0; i < POSTS.length; i++) {
    const p = POSTS[i], nr = String(i + 1).padStart(2, "0");
    fs.writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${layout(p)}
      ${p.lay === "panel" || p.lay === "split" ? "" : `<span class="nr">${nr} / ${N}</span>`}
      ${p.lay === "split" ? "" : `<div class="fuss"><img src="file://${IMG}/fachkraefte-kompass-logo-weiss.png"><span class="${p.cta ? "cta" : ""}">${p.cta ? "Kurzprofil anlegen – Link in der Bio" : "Link in der Bio"}</span></div>`}</body></html>`);
    await pg.goto("file://" + tmp); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(150);
    await pg.screenshot({ path: path.join(OUT, `fk-team-${nr}.jpg`), type: "jpeg", quality: 93 });
  }
  fs.unlinkSync(tmp); await b.close(); console.log("fertig");
})();
