// Flaches Logo-Set (nur Nachtblau, Weiß, ein Hellblau) + Facebook-Titelbild.
// Aufruf: node werbung/logo/flach/bauen.cjs → PNG/JPG in diesem Ordner
const fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const D = __dirname, L = path.join(D, ".."), IMG = path.join(D, "..", "..", "posts", "img"), F = path.join(D, "..", "..", "insta-team", "fotos");
const N = "#0F1B2D", H = "#7FA2F0", W = "#FFFFFF";
const wort = fs.readFileSync(path.join(L, "wortmarke-2farbig.svg"), "utf8");
const vb = /viewBox="([^"]+)"/.exec(wort)[1].split(" ").map(Number);
const wortSvg = (h, text, akzent) => `<svg height="${h}" width="${Math.round(h * vb[2] / vb[3])}" viewBox="${vb.join(" ")}">${wort
  .replace(/class="logo-text" fill="[^"]+"/, `class="logo-text" fill="${text}"`).replace(/class="logo-planet" fill="[^"]+"/, `class="logo-planet" fill="${akzent}"`)
  .replace(/class="logo-mond" fill="[^"]+"/, `class="logo-mond" fill="${text}"`).replace(/^<svg[^>]*>/, "").replace("</svg>", "")}</svg>`;
// Kompass flach: weißer Ring, Nadel Hellblau/Weiß
const kompass = (size, ring = W, nord = H, sued = W) => {
  const R = 300, rw = 64, L2 = (R - rw) * .86, Wd = L2 * .36, a = 35 * Math.PI / 180;
  const pt = (x, y) => `${(x * Math.cos(a) - y * Math.sin(a)).toFixed(1)},${(x * Math.sin(a) + y * Math.cos(a)).toFixed(1)}`;
  return `<svg width="${size}" height="${size}" viewBox="-320 -320 640 640"><circle r="${R - rw / 2}" fill="none" stroke="${ring}" stroke-width="${rw}"/>
  <path fill="${sued}" d="M${pt(0, L2)}L${pt(Wd, 0)}L${pt(-Wd, 0)}Z"/><path fill="${nord}" d="M${pt(0, -L2)}L${pt(Wd, 0)}L${pt(-Wd, 0)}Z"/><circle r="${(Wd * .4).toFixed(1)}" fill="${N}"/></svg>`;
};
const font = `@font-face{font-family:PJS;font-weight:400 800;src:url("file://${IMG}/plus-jakarta-sans-var.woff2") format("woff2")}*{margin:0;padding:0;box-sizing:border-box}body{font-family:PJS,sans-serif}`;
const JOBS = {
  "fk-profilbild-flach.png": [1080, 1080, `<div style="width:1080px;height:1080px;background:${N};display:grid;place-items:center">${kompass(700)}</div>`],
  "fk-profilbild-flach-schrift.png": [1080, 1080, `<div style="width:1080px;height:1080px;background:${N};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:56px">${kompass(500)}${wortSvg(80, W, H)}</div>`],
  "fk-logo-flach-dunkel.png": [1500, 260, `<div style="width:1500px;height:260px;background:${N};display:flex;align-items:center;justify-content:center;gap:34px">${kompass(150)}${wortSvg(92, W, H)}</div>`],
  "fk-logo-flach-hell.png": [1500, 260, `<div style="width:1500px;height:260px;background:${W};display:flex;align-items:center;justify-content:center;gap:34px">${kompass(150, N, "#2B59C3", N).replace(`fill="${N}"/></svg>`, `fill="${W}"/></svg>`)}${wortSvg(92, N, "#2B59C3")}</div>`],
  // Facebook-Titelbild 1640×624; wichtiger Inhalt mittig (Handy schneidet Seiten ab), unten links überdeckt das Profilbild am PC
  "fk-facebook-titelbild.jpg": [1640, 624, `<div style="position:relative;width:1640px;height:624px;background:${N};overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#fff">
    <div style="display:inline-block;background:${H};color:${N};font-weight:800;font-size:20px;letter-spacing:.2em;padding:10px 18px;border-radius:8px">DEIN EINSTELLUNGSPARTNER</div>
    <div style="font-weight:800;font-size:72px;line-height:1.06;letter-spacing:-.025em;margin-top:24px">Wir finden den Job,<br><span style="color:${H}">der zu dir passt.</span></div>
    <div style="font-weight:600;font-size:28px;color:#C9D3E3;margin-top:24px">Kostenlos &nbsp;·&nbsp; ohne Lebenslauf &nbsp;·&nbsp; 100 % vertraulich</div>
    <div style="font-weight:700;font-size:26px;color:${H};margin-top:14px">der-fachkraefte-kompass.com</div></div>`]
};
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  for (const [name, [w, h, html]] of Object.entries(JOBS)) {
    await p.setViewportSize({ width: w, height: h });
    const tmp = path.join(D, "_tmp.html"); fs.writeFileSync(tmp, `<html><head><meta charset="utf-8"><style>${font}</style></head><body>${html}</body></html>`); await p.goto("file://" + tmp); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150);
    await p.screenshot({ path: path.join(D, name), type: name.endsWith(".jpg") ? "jpeg" : "png", quality: name.endsWith(".jpg") ? 94 : undefined });
  }
  fs.unlinkSync(path.join(D, "_tmp.html")); await b.close(); console.log("fertig");
})();
