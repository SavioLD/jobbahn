// Creatives v2 „Fachkräfte Kompass“: zwei neue Ideen mit den bekannten Pain Points.
//  A) „Nachricht vom Chef“: Chatverlauf, den jeder kennt (Samstag, Gehalt, Urlaub)
//  B) „Stellenanzeigen-Übersetzer“: was in der Anzeige steht und was es wirklich heißt
// Formate: 1080×1080 (quadrat), 1080×1350 (feed), 1080×1920 (story/reel)
// Aufruf: node werbung/creatives-v2/bauen.cjs  →  werbung/creatives-v2/fertig/
const fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const D = __dirname, OUT = path.join(D, "fertig"), IMG = path.join(D, "..", "posts", "img");
fs.mkdirSync(OUT, { recursive: true });
const FORMATE = { quadrat: [1080, 1080], feed: [1080, 1350], story: [1080, 1920] };

const CSS = (w, h) => `
@font-face{font-family:PJS;font-weight:400 800;src:url("file://${IMG}/plus-jakarta-sans-var.woff2") format("woff2")}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${w}px;height:${h}px;overflow:hidden}
body{font-family:PJS,sans-serif;position:relative;--pad:${h > 1500 ? 80 : 64}px}
.seite{position:absolute;inset:0;display:flex;flex-direction:column;padding:${h > 1500 ? "150px" : "60px"} var(--pad) ${h > 1500 ? "190px" : "56px"}}
.logo{height:${h > 1500 ? 48 : 38}px;width:auto;display:block;align-self:flex-start}
.mitte{flex:1;display:flex;flex-direction:column;justify-content:center;min-height:0}
.cta{display:flex;align-items:center;justify-content:space-between;gap:24px;margin-top:${h > 1100 ? 40 : 24}px}
.btn{background:#7FA2F0;color:#0F1B2D;font-weight:800;font-size:${h > 1100 ? 32 : 28}px;padding:22px 34px;border-radius:999px;white-space:nowrap;box-shadow:0 10px 0 #0B1426}
`;

/* ---------- A) Nachricht vom Chef ---------- */
const chats = {
  samstag: {
    zeit: "Freitag, 18:47",
    kopf: ["Freitag, 18:47.", "Und du weißt schon,", "was kommt."],
    nachrichten: [["chef", "Kannst du morgen nochmal rein? 🙏"], ["du", "Eigentlich hab ich was mit den Kids vor…"], ["chef", "Ist echt wichtig. Nur bis 14 Uhr."], ["chef", "Danke dir 👍"]],
    schluss: "Es gibt Betriebe, in denen das <em>nicht normal</em> ist."
  },
  gehalt: {
    zeit: "Dienstag, 16:12",
    kopf: ["„Nächstes Jahr", "vielleicht.“", "Seit 3 Jahren."],
    nachrichten: [["du", "Können wir mal übers Gehalt reden?"], ["chef", "Gerade echt schwierig, die Auftragslage…"], ["chef", "Nächstes Jahr vielleicht."], ["du", "Das hast du letztes Jahr auch gesagt."]],
    schluss: "Dein Können ist <em>woanders mehr wert</em>. Wir zeigen dir, wo."
  },
  urlaub: {
    zeit: "Montag, 07:03",
    kopf: ["„Mal schauen.“", "Heißt bei dir", "auch Nein?"],
    nachrichten: [["du", "Kann ich im August 2 Wochen Urlaub nehmen?"], ["chef", "August geht nicht, da ist viel los."], ["du", "Und im September?"], ["chef", "Mal schauen."]],
    schluss: "Urlaub sollte <em>kein Bitten</em> sein. Wir finden dir einen Chef, der das versteht."
  }
};
function chatHtml(c, w, h) {
  const gross = h > 1500, mittel = h > 1100;
  const blasen = c.nachrichten.map(([wer, t]) => `<div class="b ${wer}">${t}<span>${wer === "du" ? "✓✓" : ""}</span></div>`).join("");
  return `<style>
  body{background:#2B59C3;color:#fff}
  .bg{position:absolute;inset:0;background:radial-gradient(120% 70% at 90% 0%,#5A85E6 0,transparent 55%),radial-gradient(90% 60% at 0% 100%,#0F1B2D 0,transparent 60%),#2B59C3}
  h1{font-weight:800;font-size:${gross ? 112 : mittel ? 86 : 66}px;line-height:1.02;letter-spacing:-3px;margin-top:0;text-shadow:0 6px 0 rgba(15,27,45,.35)}
  h1 span{display:block}
  h1 span:last-child{color:#0F1B2D;background:#fff;display:inline-block;padding:2px 18px 8px;border-radius:14px;margin-top:10px;transform:rotate(-1.5deg);text-shadow:none}
  .handy{margin:${gross ? 80 : mittel ? 44 : 26}px auto 0;width:${gross ? 900 : mittel ? 800 : 700}px;background:#0B1220;border-radius:46px;border:10px solid #0F1B2D;box-shadow:24px 24px 0 #0F1B2D,0 40px 80px rgba(0,0,0,.45);overflow:hidden;transform:rotate(${mittel ? -1.5 : 0}deg)}
  .bar{display:flex;align-items:center;gap:18px;padding:22px 28px;background:#121B2C;border-bottom:1px solid #26324A}
  .av{width:58px;height:58px;border-radius:50%;background:#5A85E6;display:grid;place-items:center;font-weight:800;font-size:26px;color:#0F1B2D}
  .bar b{display:block;font-size:28px}.bar small{color:#8FA0BC;font-size:21px}
  .verlauf{padding:${mittel ? 26 : 20}px 24px ${mittel ? 30 : 22}px;display:flex;flex-direction:column;gap:${gross ? 18 : mittel ? 14 : 9}px}
  .tag{align-self:center;background:#1A2438;color:#A3AEBF;font-size:19px;font-weight:700;padding:6px 16px;border-radius:999px;margin-bottom:6px}
  .b{max-width:78%;font-size:${gross ? 34 : mittel ? 29 : 25}px;line-height:1.3;padding:16px 22px 14px;border-radius:24px;font-weight:600;position:relative}
  .b span{font-size:16px;margin-left:10px;color:#9DB8F5;font-weight:800}
  .chef{background:#1A2438;color:#E8ECF2;align-self:flex-start;border-bottom-left-radius:6px}
  .du{background:#2B59C3;color:#fff;align-self:flex-end;border-bottom-right-radius:6px}
  .schluss{font-weight:700;font-size:${gross ? 48 : mittel ? 36 : 32}px;line-height:1.25;margin-top:${gross ? 80 : 36}px;max-width:900px}
  .schluss em{font-style:normal;color:#0F1B2D;background:#7FA2F0;padding:0 10px;border-radius:8px;-webkit-box-decoration-break:clone;box-decoration-break:clone}
  </style><div class="bg"></div><div class="seite">
  <img class="logo" src="file://${IMG}/fachkraefte-kompass-logo-weiss.png">
  <div class="mitte"><h1>${c.kopf.map(z => `<span>${z}</span>`).join("")}</h1>
  <div class="handy"><div class="bar"><div class="av">C</div><div><b>Chef</b><small>online</small></div></div>
    <div class="verlauf"><div class="tag">${c.zeit}</div>${blasen}</div></div>
  ${h > 1100 ? `<p class="schluss">${c.schluss}</p>` : ""}</div>
  <div class="cta"><span style="font-weight:700;font-size:${mittel ? 28 : 24}px;color:#EAF0FB;line-height:1.3">Kostenlos · ohne Lebenslauf<br>Dein Chef erfährt nichts</span><span class="btn">Jetzt eintragen →</span></div>
  </div>`;
}

/* ---------- B) Stellenanzeigen-Übersetzer ---------- */
const uebersetzer = {
  team: { steht: "Junges, dynamisches Team", heisst: "Die Erfahrenen sind alle schon weg." },
  flexibel: { steht: "Flexible Arbeitszeiten", heisst: "Du bist flexibel. Wir nicht." },
  familie: { steht: "Wir sind wie eine Familie", heisst: "Überstunden fragt keiner. Die macht man einfach." }
};
function uebersetzerHtml(u, w, h) {
  const gross = h > 1500, mittel = h > 1100;
  return `<style>
  body{background:#EAF0FB;color:#0F1B2D}
  .bg{position:absolute;inset:0;background:radial-gradient(80% 50% at 100% 0%,rgba(127,162,240,.55),transparent 60%),#EAF0FB}
  .kicker{display:inline-flex;align-items:center;gap:14px;margin-top:0;align-self:flex-start;background:#0F1B2D;color:#fff;font-weight:800;font-size:${mittel ? 28 : 24}px;letter-spacing:3px;padding:14px 24px;border-radius:12px;transform:rotate(-2deg);box-shadow:6px 6px 0 #7FA2F0}
  .karte{border-radius:28px;padding:${gross ? 56 : mittel ? 40 : 30}px ${gross ? 52 : 40}px;position:relative}
  .label{font-weight:800;font-size:${mittel ? 24 : 21}px;letter-spacing:3px;text-transform:uppercase}
  .steht{margin-top:${gross ? 56 : mittel ? 40 : 28}px;background:#fff;border:4px solid #0F1B2D;box-shadow:12px 12px 0 #0F1B2D}
  .steht .label{color:#4A5568}
  .steht p{font-weight:800;font-size:${gross ? 84 : mittel ? 66 : 56}px;line-height:1.05;letter-spacing:-2px;margin-top:14px}
  .pfeil{font-size:${gross ? 120 : mittel ? 90 : 60}px;line-height:1;text-align:center;color:#2B59C3;font-weight:800;margin:${mittel ? 18 : 6}px 0}
  .heisst{background:#0F1B2D;color:#fff;box-shadow:12px 12px 0 #2B59C3}
  .heisst .label{color:#7FA2F0}
  .heisst p{font-weight:800;font-size:${gross ? 84 : mittel ? 66 : 54}px;line-height:1.08;letter-spacing:-2px;margin-top:14px;color:#7FA2F0}
  .schluss{font-weight:700;font-size:${gross ? 46 : mittel ? 34 : 30}px;line-height:1.3;margin-top:${gross ? 70 : mittel ? 44 : 30}px;color:#1A2438}
  .schluss b{color:#2B59C3}
  .btn{background:#2B59C3;color:#fff;box-shadow:0 10px 0 #0F1B2D}
  </style><div class="bg"></div><div class="seite">
  <img class="logo" src="file://${IMG}/fachkraefte-kompass-logo-nachtblau.png">
  <div class="mitte"><span class="kicker">🔍 STELLENANZEIGEN-ÜBERSETZER</span>
  <div class="karte steht"><div class="label">In der Anzeige steht</div><p>„${u.steht}“</p></div>
  <div class="pfeil">↓</div>
  <div class="karte heisst"><div class="label">Heißt oft</div><p>${u.heisst}</p></div>
  ${h > 1100 ? `<p class="schluss">Bei uns erfährst du <b>vorher</b>, wie der Betrieb wirklich ist – im persönlichen Gespräch.</p>` : ""}</div>
  <div class="cta"><span style="font-weight:700;font-size:${mittel ? 28 : 24}px;color:#2B3A55;line-height:1.3">Kostenlos · ohne Lebenslauf<br>Dein Chef erfährt nichts</span><span class="btn">Jetzt eintragen →</span></div>
  </div>`;
}

(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  const tmp = path.join(D, "_tmp.html");
  const jobs = [];
  for (const [k, c] of Object.entries(chats)) jobs.push([`chef-${k}`, (w, h) => chatHtml(c, w, h)]);
  for (const [k, u] of Object.entries(uebersetzer)) jobs.push([`uebersetzer-${k}`, (w, h) => uebersetzerHtml(u, w, h)]);
  for (const [name, f] of jobs) for (const [fmt, [w, h]] of Object.entries(FORMATE)) {
    await p.setViewportSize({ width: w, height: h });
    fs.writeFileSync(tmp, `<html><head><meta charset="utf-8"><style>${CSS(w, h)}</style></head><body>${f(w, h)}</body></html>`);
    await p.goto("file://" + tmp); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(80);
    await p.screenshot({ path: path.join(OUT, `fk-${name}-${fmt}.jpg`), type: "jpeg", quality: 92 });
  }
  fs.unlinkSync(tmp); await b.close(); console.log("fertig", jobs.length * 3);
})();
