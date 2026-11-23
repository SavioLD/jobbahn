// Baut das Logo-Set „Fachkräfte Kompass“ in den Markenfarben (Nachtblau, Kobalt, Hellblau).
// Aufruf: node werbung/logo/bauen.cjs  →  PNGs in werbung/logo/fertig/
const fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const D = __dirname, OUT = path.join(D, "fertig");
fs.mkdirSync(OUT, { recursive: true });
const wort = fs.readFileSync(path.join(D, "wortmarke-2farbig.svg"), "utf8");
const vb = /viewBox="([^"]+)"/.exec(wort)[1];
const pfade = (text, akzent, nadel) => wort
  .replace(/class="logo-text" fill="[^"]+"/, `class="logo-text" fill="${text}"`)
  .replace(/class="logo-planet" fill="[^"]+"/, `class="logo-planet" fill="${akzent}"`)
  .replace(/class="logo-mond" fill="[^"]+"/, `class="logo-mond" fill="${nadel}"`)
  .replace(/^<svg[^>]*>/, "").replace("</svg>", "");
const wortSvg = (h, text, akzent, nadel) => { const v = vb.split(" ").map(Number); return `<svg height="${h}" width="${Math.round(h * v[2] / v[3])}" viewBox="${vb}">${pfade(text, akzent, nadel)}</svg>`; };
const kompass = (size, bg, ring, nord, sued, rund = 170) => {
  const R = 300, rw = 72, L = (R - rw) * 0.86, Wd = L * 0.36, a = 35 * Math.PI / 180;
  const pt = (dx, dy) => `${(dx * Math.cos(a) - dy * Math.sin(a)).toFixed(1)},${(dx * Math.sin(a) + dy * Math.cos(a)).toFixed(1)}`;
  return `<svg width="${size}" height="${size}" viewBox="-400 -400 800 800">${bg ? `<rect x="-400" y="-400" width="800" height="800" rx="${rund}" fill="${bg}"/>` : ""}
    <circle r="${R - rw / 2}" fill="none" stroke="${ring}" stroke-width="${rw}"/>
    <path fill="${sued}" d="M${pt(0, L)}L${pt(Wd, 0)}L${pt(-Wd, 0)}Z"/><path fill="${nord}" d="M${pt(0, -L)}L${pt(Wd, 0)}L${pt(-Wd, 0)}Z"/>
    <circle r="${(Wd * 0.42).toFixed(1)}" fill="${nord === "#FFFFFF" ? "#0F1B2D" : "#FFFFFF"}"/></svg>`;
};
const N = "#0F1B2D", K = "#2B59C3", H = "#7FA2F0", Wt = "#FFFFFF";
const teile = {
  // 1) Logo mit Symbol – für helle Hintergründe
  "logo-hell": [`<div style="display:flex;align-items:center;gap:34px;padding:30px">${kompass(150, N, "#5A85E6", Wt, "#5A85E6")}${wortSvg(92, N, K, H)}</div>`, null],
  // 2) Logo mit Symbol – für dunkle Hintergründe
  "logo-dunkel": [`<div style="display:flex;align-items:center;gap:34px;padding:30px">${kompass(150, K, Wt, Wt, H)}${wortSvg(92, Wt, H, Wt)}</div>`, null],
  // 3) Nur Schriftzug, zweifarbig (hell / dunkel)
  "schriftzug-hell": [`<div style="padding:30px">${wortSvg(110, N, K, H)}</div>`, null],
  "schriftzug-dunkel": [`<div style="padding:30px">${wortSvg(110, Wt, H, Wt)}</div>`, null],
  // 4) Profilbild für Instagram/Facebook (1080×1080, wird rund angezeigt)
  "profilbild": [`<div style="width:1080px;height:1080px;background:radial-gradient(circle at 70% 25%,#2B59C3,#0F1B2D 65%);display:grid;place-items:center">${kompass(760, null, H, Wt, H)}</div>`, "#0F1B2D"],
  // 5) Profilbild mit Schrift
  "profilbild-mit-schrift": [`<div style="width:1080px;height:1080px;background:radial-gradient(circle at 70% 25%,#2B59C3,#0F1B2D 65%);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:50px">${kompass(520, null, H, Wt, H)}${wortSvg(78, Wt, H, Wt)}</div>`, "#0F1B2D"],
  // 6) App-Symbol / Favicon
  "symbol": [`<div style="padding:0">${kompass(512, N, "#5A85E6", Wt, "#5A85E6", 110)}</div>`, null],
};
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 2000, height: 1200 } });
  for (const [name, [html, bg]] of Object.entries(teile)) {
    await p.setContent(`<html><body style="margin:0;background:transparent;display:inline-block"><div id="x" style="display:inline-block">${html}</div></body></html>`);
    const el = await p.$("#x");
    await el.screenshot({ path: path.join(OUT, `fachkraefte-kompass-${name}.png`), omitBackground: !bg });
    console.log("ok", name);
  }
  await b.close();
})();
