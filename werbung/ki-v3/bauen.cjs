// KI-Creatives v3 „Fachkräfte Kompass“: Kino-Bilder (Higgsfield / GPT Image) + Headline, Logo, Button.
// Rohbilder: roh/*.png (1520×2688, hochkant) und roh/*-quer.png (16:9, Motiv rechts).
// Story: Text bleibt außerhalb der Bereiche, die Instagram/Facebook oben (Profil) und unten (Antwortfeld) überdecken. Aufruf: node werbung/ki-v3/bauen.cjs → fertig/
const fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const D = __dirname, OUT = path.join(D, "fertig"), IMG = path.join(D, "..", "posts", "img");
fs.mkdirSync(OUT, { recursive: true });
const FORMATE = { quadrat: [1080, 1080], post: [1080, 1350], insta: [1080, 1440], story: [1080, 1920], quer: [1200, 628] };
// Ordner pro Format, so wie Meta beim Hochladen fragt
const ORDNER = { insta: "0-instagram-post-3x4", story: "1-story-reels-9x16", post: "2-anzeige-feed-4x5", quer: "3-querformat-1.91x1", quadrat: "4-quadrat-1x1" };
for (const o of Object.values(ORDNER)) fs.mkdirSync(path.join(OUT, o), { recursive: true });
// fokus: vertikale Bildposition beim Zuschneiden (0 = oben, 100 = unten)
const MOTIVE = {
  samstag:    { fokus: 50, fokusQuadrat: 30, h: ["Samstag?", "==Schon wieder.=="], sub: "Es gibt Betriebe, da gehört dein Wochenende dir." },
  gehalt:     { fokus: 62, h: ["Mehr Arbeit.", "==Gleicher Lohn?=="], sub: "Dein Können ist woanders mehr wert. Wir zeigen dir, wo." },
  chef:       { fokus: 40, fokusQuadrat: 8, querPos: "right top", storyVersatz: 150, h: ["Du verdienst", "==einen besseren Chef.=="], sub: "Wir finden Betriebe, in denen man dich respektiert." },
  stau:       { fokus: 70, h: ["Jeden Tag", "==1 Stunde Stau?=="], sub: "Wir finden gute Jobs in deiner Nähe." },
  hamsterrad: { fokus: 68, h: ["Rennen. Rennen.", "==Nicht vorankommen.=="], sub: "Zeit, aus dem Hamsterrad rauszukommen." },
  ausbruch:   { fokus: 8, fokusQuadrat: 5, storyVersatz: 300, h: ["Dein Job passt nicht mehr?", "==Wir finden einen besseren.=="], sub: "Kostenlos, ohne Lebenslauf – und dein Chef erfährt nichts." }
};
const html = (m, name, w, h) => {
  if (w > h) return querHtml(m, name, w, h);
  const story = h > 1500, quad = h < 1100;
  const hs = story ? 98 : quad ? 78 : 92;
  const zeilen = m.h.map(z => z.replace(/==(.+?)==/g, '<em>$1</em>')).map(z => `<span>${z}</span>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:PJS;font-weight:400 800;src:url("file://${IMG}/plus-jakarta-sans-var.woff2") format("woff2")}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${w}px;height:${h}px;overflow:hidden;font-family:PJS,sans-serif;color:#fff;background:#0B1220}
.bild{position:absolute;inset:0;background:url("file://${D}/roh/${name}.png") ${story && m.storyVersatz ? `center ${m.storyVersatz}px/100% auto` : `center ${story ? 50 : quad && m.fokusQuadrat != null ? m.fokusQuadrat : m.fokus}%/cover`} no-repeat}
.oben{position:absolute;left:0;right:0;top:0;height:${story ? 46 : 58}%;background:${story && m.storyVersatz ? `linear-gradient(180deg,#0B1220 0,#0B1220 ${m.storyVersatz}px,rgba(11,18,32,.8) ${m.storyVersatz + 260}px,rgba(11,18,32,0) 100%)` : `linear-gradient(180deg,rgba(11,18,32,.92) 0%,rgba(11,18,32,.7) 45%,rgba(11,18,32,0) 100%)`}}
.unten{position:absolute;left:0;right:0;bottom:0;height:${story ? 42 : 40}%;background:linear-gradient(0deg,rgba(15,27,45,.97) 0%,rgba(15,27,45,.85) 45%,rgba(15,27,45,0) 100%)}
.kopf{position:absolute;left:${story ? 72 : 60}px;right:${story ? 72 : 60}px;top:${story ? 270 : 56}px}
.logo{height:${story ? 46 : 36}px;display:block}
h1{font-weight:800;font-size:${hs}px;line-height:1.02;letter-spacing:-3px;margin-top:${story ? 46 : 30}px;text-shadow:0 4px 24px rgba(0,0,0,.5)}
h1 span{display:block}
h1 em{font-style:normal;color:#0F1B2D;background:#7FA2F0;padding:0 16px 6px;border-radius:14px;display:inline-block;margin-top:12px;transform:rotate(-1.5deg);text-shadow:none;box-shadow:8px 8px 0 #2B59C3}
.fuss{position:absolute;left:${story ? 72 : 60}px;right:${story ? 72 : 60}px;bottom:${story ? 380 : 52}px}
.sub{font-weight:700;font-size:${story ? 40 : quad ? 30 : 34}px;line-height:1.25;max-width:880px;text-shadow:0 2px 12px rgba(0,0,0,.6)}
.zeile{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-top:${story ? 34 : 24}px}
.haken{font-weight:700;font-size:${story ? 27 : 23}px;color:#C9D6F5;line-height:1.45}
.btn{background:#7FA2F0;color:#0F1B2D;font-weight:800;font-size:${story ? 34 : 29}px;padding:${story ? 24 : 20}px ${story ? 38 : 30}px;border-radius:999px;white-space:nowrap;box-shadow:0 8px 0 #2B59C3}
</style></head><body><div class="bild"></div><div class="oben"></div><div class="unten"></div>
<div class="kopf"><img class="logo" src="file://${IMG}/fachkraefte-kompass-logo-weiss.png"><h1>${zeilen}</h1></div>
<div class="fuss"><p class="sub">${m.sub}</p><div class="zeile"><span class="haken">✓ Kostenlos<br>✓ Dein Chef erfährt nichts</span><span class="btn">Jetzt eintragen →</span></div></div>
</body></html>`;
};
const querHtml = (m, name, w, h) => {
  const zeilen = m.h.map(z => z.replace(/==(.+?)==/g, '<em>$1</em>')).map(z => `<span>${z}</span>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:PJS;font-weight:400 800;src:url("file://${IMG}/plus-jakarta-sans-var.woff2") format("woff2")}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${w}px;height:${h}px;overflow:hidden;font-family:PJS,sans-serif;color:#fff;background:#0F1B2D}
.bild{position:absolute;inset:0;background:url("file://${D}/roh/${name}-quer.png") ${m.querPos || "right center"}/cover no-repeat}
.links{position:absolute;inset:0;background:linear-gradient(90deg,rgba(11,18,32,.96) 0%,rgba(11,18,32,.85) 38%,rgba(11,18,32,0) 62%)}
.text{position:absolute;left:52px;top:44px;bottom:44px;width:600px;display:flex;flex-direction:column}
.logo{height:30px;width:auto;align-self:flex-start}
h1{font-weight:800;font-size:56px;line-height:1.04;letter-spacing:-2px;margin-top:26px;text-shadow:0 4px 20px rgba(0,0,0,.5)}
h1 span{display:block}
h1 em{font-style:normal;color:#0F1B2D;background:#7FA2F0;padding:0 12px 4px;border-radius:10px;display:inline-block;margin-top:8px;transform:rotate(-1.5deg);text-shadow:none;box-shadow:6px 6px 0 #2B59C3}
.sub{font-weight:700;font-size:22px;line-height:1.3;margin-top:18px;color:#E8ECF2;max-width:520px}
.zeile{margin-top:auto;display:flex;align-items:center;gap:22px}
.btn{background:#7FA2F0;color:#0F1B2D;font-weight:800;font-size:24px;padding:16px 26px;border-radius:999px;white-space:nowrap;box-shadow:0 6px 0 #2B59C3}
.haken{font-weight:700;font-size:17px;color:#C9D6F5;line-height:1.45}
</style></head><body><div class="bild"></div><div class="links"></div>
<div class="text"><img class="logo" src="file://${IMG}/fachkraefte-kompass-logo-weiss.png"><h1>${zeilen}</h1><p class="sub">${m.sub}</p>
<div class="zeile"><span class="btn">Jetzt eintragen →</span><span class="haken">✓ Kostenlos<br>✓ Dein Chef erfährt nichts</span></div></div>
</body></html>`;
};
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  const tmp = path.join(D, "_tmp.html");
  for (const [name, m] of Object.entries(MOTIVE)) for (const [fmt, [w, h]] of Object.entries(FORMATE)) {
    await p.setViewportSize({ width: w, height: h });
    fs.writeFileSync(tmp, html(m, name, w, h));
    await p.goto("file://" + tmp); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(120);
    await p.screenshot({ path: path.join(OUT, ORDNER[fmt], `fk-${name}-${fmt}.jpg`), type: "jpeg", quality: 92 });
  }
  fs.unlinkSync(tmp); await b.close(); console.log("fertig");
})();
